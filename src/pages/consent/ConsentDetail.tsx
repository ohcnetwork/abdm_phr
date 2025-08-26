import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorFallback } from "@/components/ui/error-fallback";
import { Separator } from "@/components/ui/separator";

import Page from "@/components/common/Page";
import {
  ConsentBasicDetails,
  ConsentDurationDetails,
  ConsentHIPDetails,
  ConsentHITypeDetails,
  SubscriptionCategoryDetails,
} from "@/components/consent/ConsentViewDetails";
import EditConsentSheet from "@/components/consent/EditConsentSheet";
import ConsentApproveDialog, {
  buildSubscriptionPayload,
} from "@/components/consent/dialogs/ConsentApproveDialog";
import ConsentDenyDialog from "@/components/consent/dialogs/ConsentDenyDialog";
import ConsentEnableDialog from "@/components/consent/dialogs/ConsentEnableDialog";
import ConsentRevokeDialog from "@/components/consent/dialogs/ConsentRevokeDialog";

import { useConsentDetail } from "@/hooks/useConsentData";
import { useNavigation } from "@/hooks/useNavigation";

import routes from "@/api";
import {
  CONSENT_STATUS_VARIANTS,
  CONSENT_TYPE_VARIANTS,
  ConsentBase,
  ConsentStatuses,
  ConsentTypes,
  isSubscription,
} from "@/types/consent";
import { SubscriptionUpdateBaseResponse } from "@/types/subscription";
import { toTitleCase } from "@/utils";
import { mutate } from "@/utils/request/request";

interface ConsentDetailProps {
  id: string;
  type: ConsentTypes;
}

interface ConsentActions {
  canEdit: boolean;
  canApprove: boolean;
  canDeny: boolean;
  canRevoke: boolean;
  canEnable: boolean;
}

type DialogType = "edit" | "approve" | "deny" | "revoke" | "enable" | null;

const getVisibleActions = (consent: ConsentBase): ConsentActions => {
  const isSubscriptionType = isSubscription(consent.type);

  return {
    canEdit:
      consent.status === ConsentStatuses.REQUESTED ||
      (consent.status === ConsentStatuses.GRANTED && isSubscriptionType),
    canApprove: consent.status === ConsentStatuses.REQUESTED,
    canDeny: consent.status === ConsentStatuses.REQUESTED,
    canRevoke: consent.status === ConsentStatuses.GRANTED,
    canEnable: consent.status === ConsentStatuses.REVOKED && isSubscriptionType,
  };
};

function LoadingSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl space-y-6">
      <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
      <div className="h-10 w-64 animate-pulse rounded-md bg-muted" />

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6 space-y-4">
            <div className="h-6 w-40 animate-pulse rounded-md bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConsentHeader({
  consent,
  onEdit,
  canEdit,
  typeDisplay,
}: {
  consent: ConsentBase;
  onEdit: () => void;
  canEdit: boolean;
  typeDisplay: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-foreground">
              {typeDisplay} Details
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant={CONSENT_TYPE_VARIANTS[consent.type]}>
                {typeDisplay}
              </Badge>
              <Badge variant={CONSENT_STATUS_VARIANTS[consent.status]}>
                {toTitleCase(consent.status)}
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground">
            Request from {consent.requester}
          </p>
        </div>

        {canEdit && (
          <Button variant="outline" onClick={onEdit}>
            Edit {typeDisplay}
          </Button>
        )}
      </div>

      <Separator />
    </div>
  );
}

function ConsentContentSections({
  data,
  isSubscriptionType,
  typeDisplay,
}: {
  data: ConsentBase;
  isSubscriptionType: boolean;
  typeDisplay: string;
}) {
  return (
    <div className="grid gap-6">
      <ConsentBasicDetails
        requester={data.requester}
        purpose={data.purpose.text}
        requestType={typeDisplay}
      />

      <ConsentDurationDetails
        fromDate={data.fromDate}
        toDate={data.toDate}
        dataEraseAt={data.dataEraseAt}
      />

      {data.hiTypes.length > 0 && <ConsentHITypeDetails types={data.hiTypes} />}

      {isSubscriptionType && data.subscriptionCategories && (
        <SubscriptionCategoryDetails categories={data.subscriptionCategories} />
      )}

      {data.links.length > 0 && (
        <ConsentHIPDetails
          hips={data.links}
          showContexts={!isSubscriptionType}
        />
      )}
    </div>
  );
}

function ConsentActionButtons({
  actions,
  onAction,
  typeDisplay,
}: {
  actions: ConsentActions;
  onAction: (action: DialogType) => void;
  typeDisplay: string;
}) {
  const hasActions =
    actions.canApprove ||
    actions.canDeny ||
    actions.canRevoke ||
    actions.canEnable;

  if (!hasActions) return null;

  return (
    <div className="border-t pt-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-3">
        {actions.canApprove && (
          <Button
            size="lg"
            className="sm:w-auto"
            onClick={() => onAction("approve")}
          >
            Approve {typeDisplay}
          </Button>
        )}

        {actions.canDeny && (
          <Button
            variant="outline"
            size="lg"
            className="sm:w-auto border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onAction("deny")}
          >
            Deny {typeDisplay}
          </Button>
        )}

        {actions.canRevoke && (
          <Button
            variant="destructive"
            size="lg"
            className="sm:w-auto"
            onClick={() => onAction("revoke")}
          >
            Revoke {typeDisplay}
          </Button>
        )}

        {actions.canEnable && (
          <Button
            variant="default"
            size="lg"
            className="sm:w-auto"
            onClick={() => onAction("enable")}
          >
            Enable Subscription
          </Button>
        )}
      </div>
    </div>
  );
}

function ConsentDialogs({
  activeDialog,
  setActiveDialog,
  data,
  isSubscriptionType,
  onUpdate,
  isLoading,
}: {
  activeDialog: DialogType;
  setActiveDialog: (dialog: DialogType) => void;
  data: ConsentBase;
  isSubscriptionType: boolean;
  onUpdate: (data: ConsentBase) => void;
  isLoading: boolean;
}) {
  return (
    <>
      <EditConsentSheet
        open={activeDialog === "edit"}
        setOpen={(open) => setActiveDialog(open ? "edit" : null)}
        data={data}
        onUpdate={onUpdate}
        isLoading={isLoading}
      />

      <ConsentApproveDialog
        data={data}
        requestId={data.id}
        open={activeDialog === "approve"}
        setOpen={(open) => setActiveDialog(open ? "approve" : null)}
        isSubscription={isSubscriptionType}
      />

      <ConsentDenyDialog
        requestId={data.id}
        open={activeDialog === "deny"}
        setOpen={(open) => setActiveDialog(open ? "deny" : null)}
        isSubscription={isSubscriptionType}
      />

      <ConsentRevokeDialog
        requestId={data.id}
        open={activeDialog === "revoke"}
        setOpen={(open) => setActiveDialog(open ? "revoke" : null)}
        isSubscription={isSubscriptionType}
      />

      <ConsentEnableDialog
        requestId={data.id}
        open={activeDialog === "enable"}
        setOpen={(open) => setActiveDialog(open ? "enable" : null)}
      />
    </>
  );
}

export default function ConsentDetail({ id, type }: ConsentDetailProps) {
  const queryClient = useQueryClient();
  const { goBack } = useNavigation();

  const [editedData, setEditedData] = useState<ConsentBase | null>(null);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);

  const { data, isLoading, isError } = useConsentDetail({
    id,
    requestType: type,
  });

  const finalData = editedData || data;
  const actions = finalData ? getVisibleActions(finalData) : null;
  const isSubscriptionType = finalData ? isSubscription(finalData.type) : false;
  const typeDisplay = isSubscriptionType ? "Subscription" : "Consent";

  const editSubscriptionMutation = useMutation({
    mutationFn: mutate(routes.subscription.edit, {
      pathParams: { subscriptionId: id },
    }),
    onSuccess: (response: SubscriptionUpdateBaseResponse) => {
      toast.success(response.detail);
      setActiveDialog(null);
      queryClient.invalidateQueries({ queryKey: ["consents", id] });
    },
  });

  useEffect(() => {
    if (data) {
      setEditedData(data);
    }
  }, [data]);

  const handleAction = (action: DialogType) => {
    setActiveDialog(action);
  };

  const handleConsentUpdate = (updatedData: ConsentBase) => {
    if (
      isSubscription(updatedData.type) &&
      updatedData.status === ConsentStatuses.GRANTED
    ) {
      editSubscriptionMutation.mutate({
        hiuId: updatedData.hiu.id,
        subscription: buildSubscriptionPayload(updatedData),
      });
    } else {
      setEditedData(updatedData);
      toast.success("Changes saved successfully.");
      setActiveDialog(null);
    }
  };

  if (isLoading) {
    return (
      <Page title="Loading..." hideTitleOnPage>
        <LoadingSkeleton />
      </Page>
    );
  }

  if (isError || !finalData) {
    return (
      <Page title="Error" hideTitleOnPage>
        <div className="container mx-auto max-w-4xl space-y-8">
          <ErrorFallback
            title="Unable to Load Consent"
            description="We couldn't retrieve the consent details. This might be due to a network issue or the consent may no longer exist."
            action={() => goBack("/consents")}
            actionText="Back to Consents"
          />
        </div>
      </Page>
    );
  }

  return (
    <Page title={`${typeDisplay} Details`} hideTitleOnPage>
      <div className="container mx-auto max-w-4xl space-y-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => goBack("/consents")}
        >
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>

        <ConsentHeader
          consent={finalData}
          onEdit={() => handleAction("edit")}
          canEdit={actions?.canEdit ?? false}
          typeDisplay={typeDisplay}
        />

        <ConsentContentSections
          data={finalData}
          isSubscriptionType={isSubscriptionType}
          typeDisplay={typeDisplay}
        />

        {actions && (
          <ConsentActionButtons
            actions={actions}
            onAction={handleAction}
            typeDisplay={typeDisplay}
          />
        )}
      </div>

      <ConsentDialogs
        activeDialog={activeDialog}
        setActiveDialog={setActiveDialog}
        data={finalData}
        isSubscriptionType={isSubscriptionType}
        onUpdate={handleConsentUpdate}
        isLoading={editSubscriptionMutation.isPending}
      />
    </Page>
  );
}

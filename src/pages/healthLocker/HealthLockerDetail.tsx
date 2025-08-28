import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Podcast, ShieldCheck } from "lucide-react";
import { navigate } from "raviger";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ErrorFallback } from "@/components/ui/error-fallback";

import Page from "@/components/common/Page";
import AutoApprovalConfirmDialog from "@/components/healthLocker/AutoApprovalConfirmDialog";
import HealthLockerDetailCard from "@/components/healthLocker/HealthLockerDetailCard";

import { CardListSkeleton } from "@/common/loaders/SkeletonLoader";

import routes from "@/api";
import { query } from "@/utils/request/request";

interface AutoApprovalState {
  autoApprovalId: string;
  isEnable: boolean;
}

function HealthLockerDetailHeader({
  title = "Health Locker",
}: {
  title?: string;
}) {
  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => navigate("/health-lockers")}>
        <ArrowLeft className="size-4 mr-2" />
        Back to Health Lockers
      </Button>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage your health locker settings
        </p>
      </div>
    </div>
  );
}

export default function HealthLockerDetail({ id }: { id: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAutoApproval, setSelectedAutoApproval] =
    useState<AutoApprovalState | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["patientLocker", id],
    queryFn: query(routes.healthLocker.getPatientLocker, {
      pathParams: { lockerId: id },
    }),
  });

  const handleAutoApprovalClick = (
    autoApprovalId: string,
    isActive: boolean,
  ) => {
    setSelectedAutoApproval({
      autoApprovalId,
      isEnable: !isActive,
    });
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Page title="Loading..." hideTitleOnPage>
        <div className="container mx-auto max-w-4xl space-y-6">
          <HealthLockerDetailHeader />
          <CardListSkeleton count={4} />
        </div>
      </Page>
    );
  }

  if (isError || !data) {
    return (
      <Page title="Error" hideTitleOnPage>
        <div className="container mx-auto max-w-4xl space-y-6">
          <HealthLockerDetailHeader />
          <ErrorFallback
            title="Unable to Load Health Locker"
            description="We couldn’t retrieve the health locker details. This may be due to a network issue, or the locker might no longer exist."
            action={() => navigate("/health-lockers")}
            actionText="Back to Health Lockers"
          />
        </div>
      </Page>
    );
  }

  return (
    <Page title={data.lockerName} hideTitleOnPage>
      <div className="container mx-auto max-w-4xl space-y-6">
        <HealthLockerDetailHeader title={data.lockerName} />

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Subscriptions
          </h2>
          <div className="space-y-2">
            {data.subscriptions.map((subscription) => (
              <HealthLockerDetailCard
                key={subscription.subscriptionId}
                isActive={subscription.status?.toUpperCase() === "GRANTED"}
                onClick={() => {
                  navigate(
                    `/consents/${subscription.subscriptionId}/subscription-artefact`,
                  );
                }}
                icon={Podcast}
                isSubscription
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Auto Approvals
          </h2>
          <div className="space-y-2">
            {data.autoApprovals.map((autoApproval) => (
              <HealthLockerDetailCard
                key={autoApproval.autoApprovalId}
                isActive={autoApproval.isActive}
                onClick={() =>
                  handleAutoApprovalClick(
                    autoApproval.autoApprovalId,
                    autoApproval.isActive,
                  )
                }
                icon={ShieldCheck}
              />
            ))}
          </div>
        </div>

        {selectedAutoApproval && (
          <AutoApprovalConfirmDialog
            open={dialogOpen}
            setOpen={setDialogOpen}
            autoApprovalId={selectedAutoApproval.autoApprovalId}
            lockerId={id}
            isEnable={selectedAutoApproval.isEnable}
          />
        )}
      </div>
    </Page>
  );
}

import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Settings, XCircle } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import AutoApprovalConfirmDialog from "@/components/profile/dialogs/AutoApprovalConfirmDialog";

import routes from "@/api";
import { HealthIdDataResponse } from "@/types/profile";
import { query } from "@/utils/request/request";

type AutoApprovalAction = "setup" | "enable" | "disable";

const AutoApprovalSetup = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] =
    useState<AutoApprovalAction>("setup");

  const {
    data: healthIdData,
    isLoading,
    isError,
  } = useQuery<HealthIdDataResponse>({
    queryKey: ["healthIdData"],
    queryFn: query(routes.profile.healthIdData),
  });

  const handleAction = (action: AutoApprovalAction) => {
    setCurrentAction(action);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-40" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 text-destructive">
          <XCircle className="h-5 w-5" />
          <span className="text-sm font-medium">
            Failed to load auto approval settings
          </span>
        </CardContent>
      </Card>
    );
  }

  const isSetup = !!healthIdData?.auto_approve_id;
  const isEnabled = healthIdData?.is_auto_approve_enabled ?? false;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Auto Approval
          </CardTitle>
          {isSetup && (
            <Badge
              variant={isEnabled ? "primary" : "secondary"}
              className="flex items-center gap-1"
            >
              {isEnabled ? (
                <>
                  <CheckCircle className="size-3" />
                  Enabled
                </>
              ) : (
                <>
                  <XCircle className="size-3" />
                  Disabled
                </>
              )}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {!isSetup ? (
            <>
              <p className="text-sm text-muted-foreground">
                Auto approval is not set up yet. Set it up to automatically
                approve consent requests from healthcare providers.
              </p>
              <Button
                onClick={() => handleAction("setup")}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Setup Auto Approval
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Auto approval is{" "}
                <span className="font-medium">
                  {isEnabled ? "enabled" : "disabled"}
                </span>
                .{" "}
                {isEnabled
                  ? "Consent requests will be approved automatically."
                  : "You will need to approve consent requests manually."}
              </p>
              <div className="flex gap-2">
                {isEnabled ? (
                  <Button
                    variant="outline"
                    onClick={() => handleAction("disable")}
                    className="flex items-center gap-2 text-red-600 border-red-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Disable Auto Approval
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleAction("enable")}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Enable Auto Approval
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AutoApprovalConfirmDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        action={currentAction}
        autoApprovalId={healthIdData?.auto_approve_id}
      />
    </>
  );
};

export default AutoApprovalSetup;

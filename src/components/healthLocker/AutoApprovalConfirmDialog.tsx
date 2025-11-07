import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import routes from "@/api";
import { SubscriptionUpdateBaseResponse } from "@/types/subscription";
import { mutate } from "@/utils/request/request";

interface AutoApprovalConfirmDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  autoApprovalId: string;
  lockerId: string;
  isEnable: boolean;
}

export default function AutoApprovalConfirmDialog({
  open,
  setOpen,
  autoApprovalId,
  lockerId,
  isEnable,
}: AutoApprovalConfirmDialogProps) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: mutate(routes.consent.updateAutoApproval, {
      pathParams: { autoApprovalId },
    }),
    onSuccess: (response: SubscriptionUpdateBaseResponse) => {
      toast.success(response.detail);
      setOpen(false);

      queryClient.invalidateQueries({
        queryKey: ["patientLocker", lockerId],
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEnable ? "Enable Auto Approval" : "Disable Auto Approval"}
          </DialogTitle>
          <DialogDescription className="space-y-2">
            {isEnable
              ? "If you skip this step, we will ask for your consent to store data every time a new record is added. You can change this anytime from your locker preferences"
              : "Consent requests from the locker will be automatically approved. You can change this anytime from your locker preferences"}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 mt-3">
          <Button
            variant="outline"
            disabled={updateMutation.isPending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant={isEnable ? "primary" : "destructive"}
            disabled={updateMutation.isPending}
            onClick={() => updateMutation.mutate({ enable: isEnable })}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {isEnable ? "Enabling..." : "Disabling..."}
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

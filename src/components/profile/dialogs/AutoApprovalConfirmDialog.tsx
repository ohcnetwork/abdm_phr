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
import { ConsentUpdateBaseResponse } from "@/types/consent";
import { mutate } from "@/utils/request/request";

type AutoApprovalAction = "setup" | "enable" | "disable";

interface AutoApprovalConfirmDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  action: AutoApprovalAction;
  autoApprovalId?: string | null;
}

const ACTION_CONFIG: Record<
  AutoApprovalAction,
  {
    title: string;
    description: string;
    confirmText: string;
    loadingText: string;
  }
> = {
  setup: {
    title: "Setup Auto Approval",
    description:
      "Are you sure you want to setup auto approval? This will automatically approve consent requests from healthcare providers.",
    confirmText: "Setup",
    loadingText: "Setting up...",
  },
  enable: {
    title: "Enable Auto Approval",
    description:
      "Are you sure you want to enable auto approval? Consent requests will be automatically approved.",
    confirmText: "Enable",
    loadingText: "Enabling...",
  },
  disable: {
    title: "Disable Auto Approval",
    description:
      "Are you sure you want to disable auto approval? You will need to manually approve consent requests.",
    confirmText: "Disable",
    loadingText: "Disabling...",
  },
};

export default function AutoApprovalConfirmDialog({
  open,
  setOpen,
  action,
  autoApprovalId,
}: AutoApprovalConfirmDialogProps) {
  const queryClient = useQueryClient();
  const config = ACTION_CONFIG[action];

  const mutation = useMutation<ConsentUpdateBaseResponse, Error, void>({
    mutationFn: () => {
      if (action === "setup") {
        return mutate(routes.consent.setAutoApproval)(undefined);
      }
      return mutate(routes.consent.updateAutoApproval, {
        pathParams: { autoApprovalId },
      })({ enable: action === "enable" });
    },
    onSuccess: (data) => {
      toast.success(data.detail);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["healthIdData"] });
    },
  });

  return (
    <Dialog open={open} onOpenChange={mutation.isPending ? undefined : setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 mt-4">
          <Button
            variant="outline"
            disabled={mutation.isPending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
            variant={action === "disable" ? "destructive" : "primary"}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {config.loadingText}
              </>
            ) : (
              config.confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

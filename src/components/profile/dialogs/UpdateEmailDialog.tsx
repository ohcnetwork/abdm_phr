import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import EmailOtpFlow from "@/components/auth/EmailOtpFlow";

import { useAuthContext } from "@/hooks/useAuth";

import { AuthFlowTypes, INITIAL_AUTH_FORM_VALUES } from "@/types/auth";
import { ProfileUpdateActions } from "@/types/profile";

type UpdateEmailDialogProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const UpdateEmailDialog = ({ open, setOpen }: UpdateEmailDialogProps) => {
  const { logout } = useAuthContext();
  const [memory, setMemory] = useState(INITIAL_AUTH_FORM_VALUES);

  const handleOtpSuccess = () => {
    setOpen(false);
    toast.success("Your email was updated. Please log in again to continue.");
    logout(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setMemory(INITIAL_AUTH_FORM_VALUES);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Email</DialogTitle>
          <DialogDescription>
            Enter your new email address to update your profile.
          </DialogDescription>
        </DialogHeader>

        <EmailOtpFlow
          flowType={AuthFlowTypes.PROFILE_UPDATE}
          setMemory={setMemory}
          transactionId={memory.transactionId}
          onVerifyOtpSuccess={handleOtpSuccess}
          action={ProfileUpdateActions.UPDATE_EMAIL}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UpdateEmailDialog;

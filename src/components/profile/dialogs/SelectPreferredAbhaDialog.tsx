import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import AbhaNumberOtpFlow from "@/components/auth/AbhaNumberOtpFlow";

import { useAuthContext } from "@/hooks/useAuth";

import { AuthFlowTypes, INITIAL_AUTH_FORM_VALUES } from "@/types/auth";
import { ProfileUpdateActions } from "@/types/profile";

type SelectPreferredAbhaDialogProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  existingAbhaNumber: string;
};

const SelectPreferredAbhaDialog = ({
  open,
  setOpen,
  existingAbhaNumber,
}: SelectPreferredAbhaDialogProps) => {
  const { logout } = useAuthContext();
  const [memory, setMemory] = useState(INITIAL_AUTH_FORM_VALUES);

  const onVerifyOtpSuccess = () => {
    toast.success(
      "Preferred ABHA address selected successfully. Please login again.",
    );
    setOpen(false);
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
          <DialogTitle>Select Preferred ABHA Address</DialogTitle>
          <DialogDescription>
            Select a method to verify OTP for selecting your preferred ABHA
            address.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-1">
          <AbhaNumberOtpFlow
            flowType={AuthFlowTypes.PROFILE_UPDATE}
            setMemory={setMemory}
            transactionId={memory.transactionId}
            onVerifyOtpSuccess={onVerifyOtpSuccess}
            existingAbhaNumber={existingAbhaNumber}
            action={ProfileUpdateActions.SELECT_PREFERRED_ABHA}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectPreferredAbhaDialog;

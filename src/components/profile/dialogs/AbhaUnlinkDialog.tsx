import { Dispatch, SetStateAction, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import AbhaNumberOtpFlow from "@/components/auth/AbhaNumberOtpFlow";

import { useAuthContext } from "@/hooks/useAuth";

import { AuthFlowTypes, INITIAL_AUTH_FORM_VALUES } from "@/types/auth";
import { ProfileUpdateActions } from "@/types/profile";

type AbhaUnlinkDialogProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  isKYCVerified: boolean;
  existingAbhaNumber: string;
  currentAbhaAddress: string;
};

const AbhaUnlinkDialog = ({
  open,
  setOpen,
  isKYCVerified,
  existingAbhaNumber,
  currentAbhaAddress,
}: AbhaUnlinkDialogProps) => {
  const { logout } = useAuthContext();
  const [isConfirmed, setIsConfirmed] = useState(!isKYCVerified);

  const [memory, setMemory] = useState(INITIAL_AUTH_FORM_VALUES);

  const onVerifyOtpSuccess = () => {
    setOpen(false);
    logout(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isKYCVerified) {
      setIsConfirmed(false);
    }
    if (!isOpen) {
      setMemory(INITIAL_AUTH_FORM_VALUES);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {!isConfirmed ? (
          <>
            <DialogHeader>
              <DialogTitle>Unlink ABHA Number</DialogTitle>
              <DialogDescription className="space-y-2 pb-4">
                <div>
                  Even after unlinking the ABHA number, you will still be able
                  to share health records with healthcare facilities through
                  ABHA address.
                </div>
                <div>
                  Do you still want to unlink the ABHA number{" "}
                  {existingAbhaNumber} from the ABHA address{" "}
                  {currentAbhaAddress}?
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setIsConfirmed(true);
                }}
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {isKYCVerified ? "Unlink ABHA" : "Link ABHA"}
              </DialogTitle>
              <DialogDescription>
                {`Select a method to verify otp for ${
                  isKYCVerified ? "unlinking" : "linking"
                } your ABHA number.`}
              </DialogDescription>
            </DialogHeader>
            <AbhaNumberOtpFlow
              flowType={AuthFlowTypes.PROFILE_UPDATE}
              setMemory={setMemory}
              existingAbhaNumber={existingAbhaNumber}
              transactionId={memory.transactionId}
              onVerifyOtpSuccess={onVerifyOtpSuccess}
              action={
                isKYCVerified
                  ? ProfileUpdateActions.DE_LINK
                  : ProfileUpdateActions.LINK
              }
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AbhaUnlinkDialog;

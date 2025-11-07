import { Clock, Loader2 } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useAuthContext } from "@/hooks/useAuth";
import { useUserInitLinkingFlow } from "@/hooks/useUserInitLinkingFlow";

import FullScreenLoader from "@/common/loaders/FullScreenLoader";

import routes from "@/api";
import { ProviderIdentifier } from "@/types/gateway";
import {
  UserInitLinkingConfirmRequest,
  UserInitLinkingInitResponse,
} from "@/types/linkedFacility";
import dayjs from "@/utils/dayjs";
import { mutate } from "@/utils/request/request";

interface OtpVerificationStepProps {
  hip: ProviderIdentifier;
  setStep: Dispatch<SetStateAction<number>>;
  thirdStepData: UserInitLinkingInitResponse | null;
}

export const maskMobile = (mobile: string | undefined) => {
  if (!mobile) return "";
  return mobile.replace(/(\d{2})\d*(\d{2})/, "$1XXXXXX$2");
};

const OtpVerificationStep = ({
  setStep,
  thirdStepData,
  hip,
}: OtpVerificationStepProps) => {
  const { user } = useAuthContext();

  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!thirdStepData?.link?.meta.communicationExpiry) return;

    let interval: NodeJS.Timeout;
    const expiryTime = dayjs(thirdStepData?.link?.meta.communicationExpiry);

    const update = () => {
      const currentTimeInIST = dayjs().add(5, "hour").add(30, "minute");
      const diff = expiryTime.diff(currentTimeInIST, "second");

      if (diff <= 0) {
        setTimeLeft("00:00");
        clearInterval(interval);
        return;
      }
      const minutes = String(Math.floor(diff / 60)).padStart(2, "0");
      const seconds = String(diff % 60).padStart(2, "0");
      setTimeLeft(`${minutes}:${seconds}`);
    };

    update();
    interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [thirdStepData?.link?.meta.communicationExpiry]);

  const { mutation: confirmLinkingMutation, isLoading } =
    useUserInitLinkingFlow<UserInitLinkingConfirmRequest>({
      mutationFn: mutate(routes.linkedFacility.confirm),
      onSuccess: () => {
        toast.success("Successfully linked the facility");
        setStep(4);
      },
    });

  const handleConfirmLinking = () => {
    confirmLinkingMutation.mutate({
      hip,
      link_ref_number: thirdStepData?.link?.referenceNumber || "",
      token: otp,
    });
  };

  return (
    <>
      {isLoading && <FullScreenLoader />}
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-lg font-semibold">Enter OTP</CardTitle>
        <CardDescription className="text-sm text-muted-foreground leading-6">
          We’ve sent a 6-digit code to{" "}
          <span className="font-medium">+91{maskMobile(user?.mobile)}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 flex flex-col items-center">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="xsm:size-12 xs:size-10 size-9 xs:mx-1 xs:rounded-md text-lg border border-gray-300"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-4" />
          <span>OTP will expire in {timeLeft}</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          size="lg"
          className="w-full"
          onClick={handleConfirmLinking}
          disabled={otp.length !== 6 || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </CardFooter>
    </>
  );
};

export default OtpVerificationStep;

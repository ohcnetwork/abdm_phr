import { useMutation } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";

import routes from "@/api";
import { FormMemory, SendOtpBody, VerifyOtpResponse } from "@/types/auth";
import { mutate } from "@/utils/request/request";

const RESEND_OTP_DURATION = 60;

export const useOtpFlow = (
  flowType: "login" | "enrollment",
  setMemory: Dispatch<SetStateAction<FormMemory>>,
  onVerifyOtpSuccess: (
    data: VerifyOtpResponse,
    sendOtpContext?: SendOtpBody,
  ) => void,
) => {
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpValid, setIsOtpValid] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(RESEND_OTP_DURATION);

  const resetCountdown = () => setResendCountdown(RESEND_OTP_DURATION);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const interval = setInterval(() => setResendCountdown((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendCountdown]);

  const sendOtpMutationFn =
    flowType === "enrollment"
      ? mutate(routes.register.sendOtp)
      : mutate(routes.login.sendOtp);

  const sendOtpMutation = useMutation({
    mutationFn: sendOtpMutationFn,
    onSuccess: (data) => {
      toast.success(data.detail);
      setMemory((prev) => ({
        ...prev,
        transactionId: data.transaction_id,
      }));
      setOtpSent(true);
    },
  });

  const verifyOtpMutationFn =
    flowType === "enrollment"
      ? mutate(routes.register.verifyOtp)
      : mutate(routes.login.verifyOtp);

  const verifyOtpMutation = useMutation({
    mutationFn: verifyOtpMutationFn,
    onSuccess: (data) => {
      toast.success(data.detail);
      onVerifyOtpSuccess(data, sendOtpMutation.variables);
    },
    onError: () => {
      setIsOtpValid(false);
    },
  });

  return {
    otpSent,
    isOtpValid,
    setIsOtpValid,
    resendCountdown,
    resetCountdown,
    sendOtpMutation,
    verifyOtpMutation,
  };
};

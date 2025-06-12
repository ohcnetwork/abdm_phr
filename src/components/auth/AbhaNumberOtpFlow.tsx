import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { Dispatch, FC, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import OtpInput from "@/components/auth/ui/otp-resend-input";

import { useOtpFlow } from "@/hooks/useOtpFlow";

import { OTP_LENGTH } from "@/common/constants";

import { FormMemory, SendOtpBody, VerifyOtpResponse } from "@/types/auth";

type AbhaNumberOtpFlowProps = {
  flowType: "login" | "enrollment";
  transactionId?: string;
  setMemory: Dispatch<SetStateAction<FormMemory>>;
  onVerifyOtpSuccess: (
    data: VerifyOtpResponse,
    sendOtpContext?: SendOtpBody,
  ) => void;
};

const AbhaNumberOtpFlow: FC<AbhaNumberOtpFlowProps> = ({
  flowType,
  transactionId,
  setMemory,
  onVerifyOtpSuccess,
}) => {
  const {
    otpSent,
    isOtpValid,
    setIsOtpValid,
    resendCountdown,
    resetCountdown,
    sendOtpMutation,
    verifyOtpMutation,
  } = useOtpFlow(flowType, setMemory, onVerifyOtpSuccess);

  const baseSchema = z.object({
    abha: z.string().regex(/^\d{2}-\d{4}-\d{4}-\d{4}$/, {
      message: "Enter a valid 14 digit ABHA number",
    }),
    otpMethod: z.enum(["abdm", "aadhaar"], {
      errorMap: () => ({ message: "Please select an OTP method" }),
    }),
    otp: z.string().optional(),
  });

  const form = useForm({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      abha: "",
      otpMethod: undefined,
      otp: "",
    },
  });

  const onSubmit = (values: z.infer<typeof baseSchema>) => {
    if (!otpSent) {
      sendOtpMutation.mutate({
        value: values.abha,
        type: "abha-number",
        otp_system: values.otpMethod,
      });
      resetCountdown();
      return;
    }

    if (!(values.otp?.length === OTP_LENGTH && !!transactionId)) return;

    const systemKey =
      flowType === "enrollment" ? "otp_system" : "verify_system";
    setIsOtpValid(true);
    verifyOtpMutation.mutate({
      transaction_id: transactionId,
      otp: values.otp,
      type: "abha-number",
      [systemKey]: values.otpMethod,
    });
  };

  const isSubmitting = sendOtpMutation.isPending || verifyOtpMutation.isPending;
  const otpValue = form.watch("otp");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="abha"
          render={({ field }) => {
            const formatWithHyphens = (digits: string) => {
              const parts = [
                digits.slice(0, 2),
                digits.slice(2, 6),
                digits.slice(6, 10),
                digits.slice(10, 14),
              ].filter(Boolean);
              return parts.join("-");
            };

            return (
              <FormItem>
                <FormLabel>Abha Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter 14 digit abha number"
                    maxLength={17}
                    disabled={otpSent}
                    onChange={(e) => {
                      const input = e.target;
                      const raw = input.value.replace(/\D/g, "").slice(0, 14);
                      const formatted = formatWithHyphens(raw);

                      const digitIndex = input.value
                        .slice(0, input.selectionStart ?? 0)
                        .replace(/\D/g, "").length;

                      field.onChange(formatted);

                      requestAnimationFrame(() => {
                        let pos = 0,
                          count = 0;
                        while (count < digitIndex && pos < formatted.length)
                          if (/\d/.test(formatted[pos++])) count++;
                        input.setSelectionRange(pos, pos);
                      });
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="otpMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Validate using</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={otpSent}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[
                      { id: "abdm", label: "Mobile OTP" },
                      { id: "aadhaar", label: "Aadhaar OTP" },
                    ].map((otpMethod) => (
                      <SelectItem key={otpMethod.id} value={otpMethod.id}>
                        {otpMethod.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {otpSent && (
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OTP</FormLabel>
                <FormControl>
                  <OtpInput
                    maxLength={OTP_LENGTH}
                    isOtpValid={isOtpValid}
                    otpValue={otpValue}
                    onChange={(value) => {
                      field.onChange(value);
                      setIsOtpValid(true);
                    }}
                    resendCountdown={resendCountdown}
                    onResend={() => {
                      sendOtpMutation.mutate({
                        value: form.watch("abha"),
                        type: "abha-number",
                        otp_system: form.watch("otpMethod"),
                      });
                      resetCountdown();
                    }}
                    disabled={isSubmitting}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={
            isSubmitting ||
            (!otpSent && !form.formState.isDirty) ||
            (otpSent && (!otpValue || otpValue.length !== OTP_LENGTH))
          }
        >
          {isSubmitting ? (
            <Loader2Icon className="text-white animate-spin scale-150" />
          ) : otpSent ? (
            "Verify OTP"
          ) : (
            "Send OTP"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default AbhaNumberOtpFlow;

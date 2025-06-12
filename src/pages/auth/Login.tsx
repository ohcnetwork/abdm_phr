import { useNavigate } from "raviger";
import { FC } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import AbhaAddressFlow from "@/components/auth/AbhaAddressFlow";
import AbhaNumberOtpFlow from "@/components/auth/AbhaNumberOtpFlow";
import HandleExistingAbhaAddress from "@/components/auth/HandleExistingAbha";
import MobileNumberOtpFlow from "@/components/auth/MobileNumberOtpFlow";

import useMultiStepForm, { InjectedStepProps } from "@/hooks/useMultiStepForm";

import { AuthMode, FormMemory, VerifyOtpResponse } from "@/types/auth";

const LoginAbha = () => {
  const { currentStep } = useMultiStepForm<FormMemory>(
    [
      {
        id: "login",
        element: <Login {...({} as LoginProps)} />,
      },
      {
        id: "handle-existing-abha",
        element: <HandleExistingAbha {...({} as HandleExistingAbhaProps)} />,
      },
    ],
    {
      transactionId: "mock-id",
      mode: "mobile-number",
      existingAbhaAddresses: [],
    },
  );

  return (
    <div className="flex min-h-screen flex-col-reverse md:flex-row">
      <div className="bg-primary-500 flex-1"></div>
      <div className="md:w-1/2 w-full flex justify-center items-center my-8">
        <div className="w-full max-w-[400px]">{currentStep}</div>
      </div>
    </div>
  );
};

export default LoginAbha;

type LoginProps = InjectedStepProps<FormMemory>;

const Login: FC<LoginProps> = ({ memory, setMemory, goTo }) => {
  const navigate = useNavigate();

  const onVerifyOtpSuccess = (data: VerifyOtpResponse) => {
    setMemory((prev) => ({
      ...prev,
      transactionId: data.transaction_id,
      existingAbhaAddresses: data.users,
    }));

    goTo("handle-existing-abha");
  };

  return (
    <Card className="mx-4">
      <CardHeader className="space-y-1 px-4">
        <CardTitle className="text-2xl font-bold">Login to ABHA</CardTitle>
        <CardDescription>Select your preferred login method.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="mobile-number"
          value={memory?.mode ?? "mobile-number"}
          onValueChange={(value) => {
            setMemory((prev) => ({
              ...prev,
              mode: value as AuthMode,
            }));
          }}
        >
          <TabsList className="flex w-full">
            <TabsTrigger className="flex-1" value="mobile-number">
              Mobile
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="abha-number">
              ABHA Number
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="abha-address">
              ABHA Address
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mobile-number">
            <MobileNumberOtpFlow
              flowType="login"
              transactionId={memory?.transactionId}
              setMemory={setMemory}
              onVerifyOtpSuccess={onVerifyOtpSuccess}
            />
          </TabsContent>

          <TabsContent value="abha-number">
            <AbhaNumberOtpFlow
              flowType="login"
              transactionId={memory?.transactionId}
              setMemory={setMemory}
              onVerifyOtpSuccess={onVerifyOtpSuccess}
            />
          </TabsContent>

          <TabsContent value="abha-address">
            <AbhaAddressFlow
              flowType="login"
              transactionId={memory?.transactionId}
              setMemory={setMemory}
              onVerifyOtpSuccess={onVerifyOtpSuccess}
            />
          </TabsContent>
          <div className="mt-4 text-sm text-center text-gray-500">
            <span>Don't have an account? </span>
            <Button
              variant="link"
              className="h-auto p-0 text-primary-600"
              onClick={() => navigate("/register")}
            >
              Register
            </Button>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

type HandleExistingAbhaProps = InjectedStepProps<FormMemory>;

const HandleExistingAbha: FC<HandleExistingAbhaProps> = ({ memory, goTo }) => {
  return (
    <HandleExistingAbhaAddress flowType="login" memory={memory} goTo={goTo} />
  );
};

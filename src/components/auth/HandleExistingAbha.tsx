import { Loader2Icon } from "lucide-react";
import { FC, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useAuthContext } from "@/hooks/useAuth";

import { FormMemory } from "@/types/auth";

interface HandleExistingAbhaProps {
  flowType: "enrollment" | "login";
  memory: FormMemory | null;
  goTo: (step: string) => void;
}

const HandleExistingAbhaAddress: FC<HandleExistingAbhaProps> = ({
  memory,
  goTo,
  flowType,
}) => {
  const { verifyUser, isVerifyingUser } = useAuthContext();

  const { existingAbhaAddresses = [] } = memory || {};

  const [selectedAddress, setSelectedAddress] = useState(
    existingAbhaAddresses[0]?.abhaAddress || "",
  );

  const handleCreateNew = () => {
    if (memory?.mode === "abha-number") goTo("choose-abha-address");
    else goTo("add-demographic-details");
  };

  useEffect(() => {
    if (!existingAbhaAddresses.length && flowType === "enrollment") {
      handleCreateNew();
    }
  }, [existingAbhaAddresses.length, flowType]);

  const handleSelectExisting = () => {
    if (!selectedAddress || !memory?.transactionId) {
      return;
    }
    verifyUser({
      abha_address: selectedAddress,
      transaction_id: memory.transactionId,
      type: memory.mode,
      verify_system: "abdm", //TODO: Update this based on flow type
    });
  };

  if (!existingAbhaAddresses.length && flowType === "login") {
    return (
      <div className="text-center text-gray-600 p-4">
        <p>No ABHA addresses linked to your account.</p>
      </div>
    );
  }

  const content = (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium">Select an address:</p>
        <ScrollArea className="w-full rounded-md border p-3">
          <div className="max-h-48 space-y-2">
            {existingAbhaAddresses.map(({ abhaAddress }) => {
              const isSelected = abhaAddress === selectedAddress;
              return (
                <div
                  key={abhaAddress}
                  className={cn(
                    "relative cursor-pointer rounded-lg border p-3 text-sm shadow-sm transition-colors flex items-center",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "hover:bg-primary/5",
                  )}
                  onClick={() => setSelectedAddress(abhaAddress)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedAddress(abhaAddress);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full border border-gray-400 transition-colors",
                        isSelected ? "border-primary bg-primary" : "bg-white",
                      )}
                    />
                    <div className="font-mono">{abhaAddress}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-4">
        <Button
          className="w-full"
          disabled={!selectedAddress || isVerifyingUser}
          onClick={handleSelectExisting}
        >
          {isVerifyingUser ? (
            <Loader2Icon className="text-white animate-spin scale-150" />
          ) : (
            "Continue"
          )}
        </Button>

        {flowType === "enrollment" && (
          <>
            <div className="relative flex items-center justify-center text-xs uppercase">
              <span className="absolute left-0 right-0 top-1/2 border-t border-gray-400 opacity-60" />
              <span className="relative z-10 bg-white px-2 text-gray-700">
                Or
              </span>
            </div>
            <div className="text-sm text-center text-gray-500">
              <span>Still want to create a new ABHA address? </span>
              <Button
                variant="link"
                className="h-auto p-0 text-primary-600"
                disabled={isVerifyingUser}
                onClick={handleCreateNew}
              >
                Create
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <Card className="mx-4 sm:w-full">
      <CardHeader className="space-y-1 px-4">
        <CardTitle className="text-2xl font-bold">
          Existing ABHA Addresses
        </CardTitle>
        <CardDescription className="text-sm">
          We found {existingAbhaAddresses.length} ABHA address
          {existingAbhaAddresses.length > 1 && "es"} associated with your
          account. Choose one to continue{" "}
          {flowType === "enrollment" && "or create a new one"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">{content}</CardContent>
    </Card>
  );
};

export default HandleExistingAbhaAddress;

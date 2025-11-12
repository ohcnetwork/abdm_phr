import { UserSearch } from "lucide-react";
import { navigate } from "raviger";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import AbhaAddressSelector from "@/components/common/AbhaAddressSelector";

import { useAuthContext } from "@/hooks/useAuth";

import { AuthFlowTypes, AuthModes, FormMemory } from "@/types/auth";

interface HandleExistingAbhaProps {
  flowType: AuthFlowTypes;
  memory: FormMemory | null;
  goTo: (step: string) => void;
}

function AuthEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center pb-6 pt-4 text-muted-foreground">
      <UserSearch className="w-10 h-10 mb-2 text-gray-400" />
      <p className="text-md font-medium">No addresses found</p>
      <p className="text-sm text-center max-w-xs">
        <span>
          You don&apos;t have any ABHA address linked yet. To get started, you
          can{" "}
        </span>
        <Button
          variant="link"
          className="h-auto p-0 inline"
          onClick={() => navigate("/register")}
        >
          create one here
        </Button>
        .
      </p>
    </div>
  );
}

const HandleExistingAbhaAddress = ({
  memory,
  goTo,
  flowType,
}: HandleExistingAbhaProps) => {
  const { verifyUser, isVerifyingUser } = useAuthContext();

  const existingAbhaAddresses = memory?.existingAbhaAddresses ?? [];
  const hasAddresses = existingAbhaAddresses.length > 0;

  const handleCreateNew = () => {
    if (!memory) {
      return;
    }

    if (memory.mode === AuthModes.ABHA_NUMBER) {
      goTo("choose-abha-address");
    } else {
      goTo("add-personal-details");
    }
  };

  const handleSelectExisting = (selectedAddress: string) => {
    if (!selectedAddress || !memory) {
      return;
    }

    verifyUser({
      abha_address: selectedAddress,
      transaction_id: memory.transactionId,
      type: memory.mode,
      verify_system: memory.verifySystem,
    });
  };

  useEffect(() => {
    if (!hasAddresses && flowType === AuthFlowTypes.ENROLLMENT && memory) {
      handleCreateNew();
    }
  }, [hasAddresses, flowType, memory, handleCreateNew]);

  const getCardDescription = () => {
    if (!hasAddresses) return null;

    const addressCount = existingAbhaAddresses.length;
    const plural = addressCount > 1 ? "es" : "";
    const createNewText =
      flowType === AuthFlowTypes.ENROLLMENT ? " or create a new one" : "";

    return `We found ${addressCount} ABHA address${plural} associated with your account. Choose one to continue${createNewText}.`;
  };

  return (
    <Card className="mx-4 sm:w-full">
      <CardHeader className="space-y-1 px-4">
        <CardTitle className="text-2xl font-bold">
          Existing ABHA Addresses
        </CardTitle>
        {hasAddresses && (
          <CardDescription className="text-sm">
            {getCardDescription()}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <AbhaAddressSelector
          addresses={existingAbhaAddresses}
          isActionLoading={isVerifyingUser}
          onContinue={handleSelectExisting}
          showCreateNew={flowType === AuthFlowTypes.ENROLLMENT}
          onCreateNew={handleCreateNew}
          emptyState={<AuthEmptyState />}
          preferredAbhaAddress={""}
        />
      </CardContent>
    </Card>
  );
};

export default HandleExistingAbhaAddress;

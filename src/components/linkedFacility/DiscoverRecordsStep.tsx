import { FileText, Link2, Loader2, User } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useAuthContext } from "@/hooks/useAuth";
import { useUserInitLinkingFlow } from "@/hooks/useUserInitLinkingFlow";

import FullScreenLoader from "@/common/loaders/FullScreenLoader";

import routes from "@/api";
import { ProviderIdentifier } from "@/types/gateway";
import {
  Patient,
  UserInitLinkingDiscoverResponse,
  UserInitLinkingInitRequest,
  UserInitLinkingInitResponse,
} from "@/types/linkedFacility";
import { mutate } from "@/utils/request/request";

interface DiscoverRecordsStepProps {
  hip: ProviderIdentifier;
  setStep: Dispatch<SetStateAction<number>>;
  secondStepData: UserInitLinkingDiscoverResponse | null;
  setThirdStepData: Dispatch<
    SetStateAction<UserInitLinkingInitResponse | null>
  >;
}

const DiscoverRecordsStep = ({
  setStep,
  setThirdStepData,
  hip,
  secondStepData,
}: DiscoverRecordsStepProps) => {
  const { user } = useAuthContext();

  const [updatedPatient, setUpdatedPatient] = useState<Patient[]>(
    () =>
      secondStepData?.patient?.map((patient) => ({
        ...patient,
        careContexts: [...patient.careContexts],
      })) ?? [],
  );

  const { mutation: initLinkingMutation, isLoading } =
    useUserInitLinkingFlow<UserInitLinkingInitRequest>({
      mutationFn: mutate(routes.linkedFacility.init),
      onSuccess: (data) => {
        toast.success("Linking initiated successfully");
        setThirdStepData(data.data as UserInitLinkingInitResponse);
        setStep(3);
      },
    });

  const toggleCareContext = (
    index: number,
    referenceNumber: string,
    isChecked: boolean,
  ) => {
    setUpdatedPatient((prev) => {
      const newPatients = [...prev];

      if (isChecked) {
        newPatients[index] = {
          ...newPatients[index],
          careContexts: newPatients[index].careContexts.filter(
            (careContext) => careContext.referenceNumber !== referenceNumber,
          ),
        };
      } else {
        const currCareContext = secondStepData?.patient[
          index
        ].careContexts.find(
          (careContext) => careContext.referenceNumber === referenceNumber,
        );

        if (currCareContext) {
          newPatients[index] = {
            ...newPatients[index],
            careContexts: [...newPatients[index].careContexts, currCareContext],
          };
        }
      }

      return newPatients;
    });
  };

  const selectedCount = updatedPatient.reduce(
    (acc, patient) => acc + patient.careContexts.length,
    0,
  );

  const handleInitLinking = () => {
    if (!secondStepData) return;

    const patientsWithCareContexts = updatedPatient.filter(
      (patient) => patient.careContexts.length > 0,
    );

    initLinkingMutation.mutate({
      hip,
      transaction_id: secondStepData.transactionId,
      patient: patientsWithCareContexts,
    });
  };

  return (
    <>
      {isLoading && <FullScreenLoader />}
      <CardHeader>
        <CardTitle>We found the following details</CardTitle>
        <CardDescription>
          Select the health records you want to link to your account.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-medium">
              {secondStepData?.patient?.[0]?.display || user?.fullName}
            </div>
            <div className="text-sm text-muted-foreground">
              Patient ID:{" "}
              {secondStepData?.patient?.[0]?.referenceNumber || "N/A"}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {!secondStepData?.patient || secondStepData?.patient?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-3">
                <FileText className="size-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                No records found for this patient
              </p>
            </div>
          ) : (
            secondStepData?.patient?.map(
              ({ careContexts, hiType }, patientIndex) => (
                <div
                  key={patientIndex}
                  className="rounded-lg border bg-card shadow-sm"
                >
                  <div className="flex items-center justify-between flex-wrap gap-1 border-b px-4 py-3 bg-muted/20">
                    <Badge variant="secondary" className="font-medium">
                      {hiType}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {careContexts.length} context
                      {careContexts.length > 1 && "s"}
                    </span>
                  </div>
                  <ScrollArea>
                    <div className="p-4 space-y-2 max-h-[350px]">
                      {careContexts.map(({ display, referenceNumber }) => {
                        const isChecked = updatedPatient[
                          patientIndex
                        ]?.careContexts.some(
                          (ctx) => ctx.referenceNumber === referenceNumber,
                        );

                        return (
                          <Label
                            key={referenceNumber}
                            className={cn(
                              "flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                              isChecked && "border-primary bg-primary/5",
                            )}
                          >
                            <Checkbox
                              className="text-white"
                              checked={isChecked}
                              onCheckedChange={() =>
                                toggleCareContext(
                                  patientIndex,
                                  referenceNumber,
                                  isChecked,
                                )
                              }
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {display}
                              </div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {referenceNumber}
                              </div>
                            </div>
                          </Label>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              ),
            )
          )}
        </div>
      </CardContent>

      <CardFooter className="mt-2">
        <Button
          size="lg"
          className="w-full"
          disabled={selectedCount === 0 || isLoading}
          onClick={handleInitLinking}
        >
          {isLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Link2 className="mr-2 size-4" />
          )}
          {isLoading
            ? "Linking..."
            : `Link Selected Records (${selectedCount})`}
        </Button>
      </CardFooter>
    </>
  );
};

export default DiscoverRecordsStep;

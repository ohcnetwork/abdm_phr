import { createContext, useContext } from "react";

import { PatientLink } from "@/types/gateway";

interface PatientLinksContextType {
  patientLinks: PatientLink[];
  isLoading: boolean;
  isError: boolean;
  getHipName: (hip_id: string) => string | undefined;
}

export const PatientLinksContext =
  createContext<PatientLinksContextType | null>(null);

export function usePatientLinks() {
  const context = useContext(PatientLinksContext);
  if (!context) {
    throw new Error("usePatientLinks must be used within PatientLinksProvider");
  }
  return context;
}

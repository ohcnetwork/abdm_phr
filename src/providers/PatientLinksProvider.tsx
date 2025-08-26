import { useQuery } from "@tanstack/react-query";

import { PatientLinksContext } from "@/hooks/usePatientLinks";

import routes from "@/api";
import { query } from "@/utils/request/request";

interface Props {
  children: React.ReactNode;
}

export default function PatientLinksProvider({ children }: Props) {
  const {
    data: patientLinks,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["patientLinks"],
    queryFn: query(routes.gateway.listPatientLinks, { silent: true }),
    retry: false,
  });

  return (
    <PatientLinksContext.Provider
      value={{
        patientLinks: patientLinks ?? [],
        isLoading,
        isError,
      }}
    >
      {children}
    </PatientLinksContext.Provider>
  );
}

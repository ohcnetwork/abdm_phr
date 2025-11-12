export interface HealthFacility {
  id: string;
  name: string;
  type?: string;
}

export interface PatientCareContext {
  patientReference: string;
  careContextReference: string;
  display: string;
}

export interface PatientLink {
  hip: HealthFacility;
  careContexts: PatientCareContext[];
}

export interface ProviderIdentifier {
  name: string;
  id: string;
}

export interface Provider {
  identifier: ProviderIdentifier;
  facilityType: string[];
  isGovtEntity: boolean;
}

export interface ScanAndShareToken {
  id: number;
  patientId: string;
  tokenNumber: string;
  hipId: string;
  hipName: string;
  hipAddress: string;
  expiresIn: string;
  clientId: string;
  dateCreated: string;
  counterCode: string;
}

export interface SharePatientProfileRequest {
  hip_id: string;
  context: string;
  hpr_id?: string;
  latitude?: number;
  longitude?: number;
}

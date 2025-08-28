import * as LucideIcons from "lucide-react";

export enum ConsentCategories {
  REQUESTS = "REQUESTS",
  APPROVED = "APPROVED",
}

export enum ConsentStatuses {
  REQUESTED = "REQUESTED",
  GRANTED = "GRANTED",
  DENIED = "DENIED",
  EXPIRED = "EXPIRED",
  REVOKED = "REVOKED",
}

export enum ConsentTypes {
  CONSENT = "consent",
  ARTEFACT = "artefact",
  SUBSCRIPTION = "subscription",
  SUBSCRIPTION_ARTEFACT = "subscription-artefact",
}

export enum ConsentHITypes {
  PRESCRIPTION = "Prescription",
  DIAGNOSTIC_REPORT = "DiagnosticReport",
  OP_CONSULTATION = "OPConsultation",
  DISCHARGE_SUMMARY = "DischargeSummary",
  IMMUNIZATION_RECORD = "ImmunizationRecord",
  HEALTH_DOCUMENT_RECORD = "HealthDocumentRecord",
  WELLNESS_RECORD = "WellnessRecord",
  INVOICE = "Invoice",
}

export const CONSENT_STATUS_BY_CATEGORY: Record<
  ConsentCategories,
  ConsentStatuses[]
> = {
  [ConsentCategories.REQUESTS]: [
    ConsentStatuses.REQUESTED,
    ConsentStatuses.DENIED,
    ConsentStatuses.EXPIRED,
  ],
  [ConsentCategories.APPROVED]: [
    ConsentStatuses.GRANTED,
    ConsentStatuses.REVOKED,
    ConsentStatuses.EXPIRED,
  ],
} as const;

export const CONSENT_TYPE_VARIANTS = {
  [ConsentTypes.CONSENT]: "blue",
  [ConsentTypes.SUBSCRIPTION]: "purple",
  [ConsentTypes.ARTEFACT]: "blue",
  [ConsentTypes.SUBSCRIPTION_ARTEFACT]: "purple",
} as const;

export const CONSENT_STATUS_VARIANTS = {
  [ConsentStatuses.REQUESTED]: "yellow",
  [ConsentStatuses.GRANTED]: "green",
  [ConsentStatuses.DENIED]: "destructive",
  [ConsentStatuses.EXPIRED]: "secondary",
  [ConsentStatuses.REVOKED]: "orange",
} as const;

export const CONSENT_HI_TYPES_ICONS = {
  [ConsentHITypes.PRESCRIPTION]: LucideIcons.FileText,
  [ConsentHITypes.DIAGNOSTIC_REPORT]: LucideIcons.Microscope,
  [ConsentHITypes.OP_CONSULTATION]: LucideIcons.Stethoscope,
  [ConsentHITypes.DISCHARGE_SUMMARY]: LucideIcons.ClipboardList,
  [ConsentHITypes.IMMUNIZATION_RECORD]: LucideIcons.Syringe,
  [ConsentHITypes.HEALTH_DOCUMENT_RECORD]: LucideIcons.FilePlus,
  [ConsentHITypes.WELLNESS_RECORD]: LucideIcons.HeartPulse,
  [ConsentHITypes.INVOICE]: LucideIcons.ReceiptText,
} as const;

export interface ConsentPurpose {
  text: string;
  code: "CAREMGT" | "BTG" | "PUBHLTH" | "HPAYMT" | "DSRCH" | "PATRQT";
  refUri: string;
}

export interface ConsentPatient {
  id: string;
}

export interface ConsentHealthFacility {
  id: string;
  name?: string;
  type?: string;
}

export interface ConsentCareContext {
  patientReference: string;
  careContextReference: string;
  display?: string; // optional display name for care context comes when the care context is fetched from the HIP
}

export interface ConsentRequester {
  name?: string | null;
  identifier: {
    value: string;
    type: string;
    system: string;
  };
}

export interface ConsentDateRange {
  from: string;
  to: string;
}

export interface ConsentFrequency {
  unit: "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR";
  value: number;
  repeats: number;
}

export interface ConsentPermission {
  accessMode: "VIEW" | "STORE" | "QUERY" | "STREAM";
  dateRange: ConsentDateRange;
  dataEraseAt: string;
  frequency: ConsentFrequency;
}

export interface ConsentRequest {
  requestId: string;
  purpose: ConsentPurpose;
  patient: ConsentPatient;
  hip?: ConsentHealthFacility;
  hiu: ConsentHealthFacility;
  careContexts?: ConsentCareContext[];
  requester: ConsentRequester;
  status: ConsentStatuses;
  createdAt: string;
  lastUpdated: string;
  hiTypes: ConsentHITypes[];
  permission: ConsentPermission;
}

export interface ConsentArtefact {
  status: ConsentStatuses;
  consentDetail: {
    consentId: string;
    purpose: ConsentPurpose;
    patient: ConsentPatient;
    hip: ConsentHealthFacility;
    hiu: ConsentHealthFacility;
    careContexts: ConsentCareContext[];
    requester: ConsentRequester;
    createdAt: string;
    lastUpdated: string;
    hiTypes: ConsentHITypes[];
    permission: ConsentPermission;
  };
  signature: string;
}

export interface ConsentListResponse<T> {
  results: T[];
  hasMore: boolean;
}

export interface ConsentLinks {
  hip: ConsentHealthFacility;
  careContexts?: ConsentCareContext[];
}

export interface ConsentRequestResponse {
  request: ConsentRequest;
  links: ConsentLinks[];
}

export interface ConsentArtefactResponse {
  artefact: ConsentArtefact;
  links: ConsentLinks[];
}

export interface ConsentApproveRequest {
  consents: {
    hiTypes: ConsentHITypes[];
    hip: ConsentHealthFacility;
    careContexts: ConsentCareContext[];
    permission: ConsentPermission;
  }[];
}

export interface ConsentDenyRequest {
  reason?: string;
}

export interface ConsentRevokeRequest {
  consents: string[];
}

export interface AutoApprovalUpdateRequest {
  enable: boolean;
}

export interface ConsentInitRequest {
  patient_id: string;
}

export interface ConsentUpdateBaseResponse {
  detail: string;
}

enum SubscriptionCategories {
  LINK = "LINK",
  DATA = "DATA",
}

//Base consent type for all the consent types
export interface ConsentBase {
  id: string;
  type: ConsentTypes;
  requester: string;
  hiu: ConsentHealthFacility;
  purpose: ConsentPurpose;
  fromDate: string;
  toDate: string;
  status: ConsentStatuses;
  hiTypes: ConsentHITypes[];
  links: ConsentLinks[];

  dataEraseAt?: string; //only for consent
  rawPermission?: ConsentPermission; //only for consent (used while approving consent)

  subscriptionCategories?: SubscriptionCategories[]; //only for subscription
  availableLinks?: ConsentLinks[]; //only for subscription (used while approving or editing subscription)
}

export const isSubscription = (type: ConsentTypes) =>
  type.includes("subscription");

import { Gender, KycStatus, PhrProfilePartial } from "./profile";

export type AuthMode = "abha-number" | "mobile-number" | "abha-address";
export type VerifySystem = "abdm" | "aadhaar";
export type AuthMethod =
  | "MOBILE_OTP"
  | "PASSWORD"
  | "EMAIL_OTP"
  | "AADHAAR_OTP";

export type User = {
  abhaAddress: string;
  fullName: string;
  abhaNumber: string;
  status: string;
  kycStatus: KycStatus;
};

export type PhrAddressDetails = {
  abha_address: string;
  address: string;
  day_of_birth?: string;
  month_of_birth?: string;
  year_of_birth: string;
  first_name: string;
  last_name?: string;
  middle_name?: string;
  gender: Gender;
  district_code: string;
  district_name: string;
  state_code: string;
  state_name: string;
  pincode: string;
  mobile: string;
  email?: string;
  profile_photo?: string | null;
  password: string;
};

// Verification specific types
export type SendOtpBody = {
  value: string;
  type: AuthMode;
  otp_system?: VerifySystem;
  verify_system?: VerifySystem;
};

export type SendOtpResponse = {
  transaction_id: string;
  detail: string;
};

export type VerifyOtpBody = {
  otp: string;
  transaction_id: string;
} & Omit<SendOtpBody, "value">;

export type VerifyOtpResponse = SendOtpResponse & {
  users: User[];
  abha_number?: PhrProfilePartial;
};

export type VerifyPasswordBody = {
  password: string;
  abha_address: string;
  type: "abha-address";
  verify_system: "password";
};

export type VerifyUserBody = {
  abha_address: string;
  transaction_id: string;
  type: AuthMode;
  verify_system: VerifySystem;
};

export type VerifyUserResponse = {
  abha_number: PhrProfilePartial;
};

export type CheckAuthMethodsBody = {
  abha_address: string;
};

export type CheckAuthMethodsResponse = {
  auth_methods: AuthMethod[];
  abha_number: string;
};

// Enrolment specific types
export type AbhaAddressSuggestionsBody = {
  transaction_id: string;
  first_name: string;
  year_of_birth: string;
  last_name?: string;
  month_of_birth?: string;
  day_of_birth?: string;
};

export type AbhaAddressSuggestionsResponse = {
  abha_addresses: string[];
  transaction_id: string;
};

export type AbhaAddressExistsBody = {
  abha_address: string;
};

export type AbhaAddressExistsResponse = {
  exists: boolean;
};

export type EnrolAddressBody = {
  transaction_id: string;
  phr_details: PhrAddressDetails;
};

// Form memory type to store state during the auth flow
export type FormMemory = {
  transactionId: string;
  mode: AuthMode;
  existingAbhaAddresses?: User[];
  phrProfile?: PhrAddressDetails;
};

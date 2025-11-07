import { GENDERS } from "@/common/constants";

export enum KycStatuses {
  VERIFIED = "VERIFIED",
  PENDING = "PENDING",
}

export enum ProfileUpdateActions {
  SELECT_PREFERRED_ABHA = "SELECT_PREFERRED_ABHA",
  UPDATE_MOBILE = "UPDATE_MOBILE",
  UPDATE_EMAIL = "UPDATE_EMAIL",
  LINK = "LINK",
  DE_LINK = "DE_LINK",
}

export type Gender = (typeof GENDERS)[number];
export type BoolString = "true" | "false";

export interface User {
  abhaAddress: string;
  fullName: string;
  abhaNumber: string;
  status: string;
  kycStatus: KycStatuses;
}

interface BasicProfileFields {
  address: string;
  first_name: string;
  middle_name?: string | null;
  last_name?: string | null;
  gender: Gender;
  mobile: string;
  pincode: string;
  email?: string | null;
  district_code: string;
  state_code: string;
  profile_photo?: string | null;
}

export interface PhrEnrolDetails extends BasicProfileFields {
  abha_address: string;
  day_of_birth?: string;
  month_of_birth?: string;
  year_of_birth: string;
  district_name: string;
  state_name: string;
  password: string;
}

export interface PhrProfilePartial extends BasicProfileFields {
  phr_health_id: string | null;
  name: string;
  date_of_birth: string;
  district: string;
  state: string;
}

export interface PhrProfile {
  abhaAddress: string;
  abhaNumber?: string;
  fullName: string;
  firstName: string;
  middleName: string | null;
  lastName: string | null;
  gender: Gender;
  dateOfBirth?: string | null;
  dayOfBirth: string | null;
  monthOfBirth: string | null;
  yearOfBirth: string;
  address: string;
  districtName: string;
  districtCode: string;
  stateName: string;
  stateCode: string;
  pinCode: string;
  mobile: string;
  email: string | null;
  profilePhoto: string | null;
  mobileVerified: BoolString;
  emailVerified: BoolString;
  kycStatus: KycStatuses;
  preferredAbhaAddress?: string;
  status: string;
}

export interface HealthIdDataResponse {
  auto_approve_id: string | null;
  is_auto_approve_enabled: boolean;
}

export interface ProfileSwitchResponse {
  transaction_id: string;
  users: User[];
}

export interface ProfileSwitchVerifyRequest {
  abha_address: string;
  transaction_id: string;
}

export interface ProfileUpdateRequest {
  address: string;
  first_name: string;
  middle_name?: string;
  last_name?: string;
  gender: Gender;
  day_of_birth?: string;
  month_of_birth?: string;
  year_of_birth: string;
  state_code: string;
  state_name: string;
  district_code: string;
  district_name: string;
  pincode: string;
  profile_photo?: string | null;
}

export interface PasswordUpdateRequest {
  abha_address: string;
  password: string;
}

export interface PasswordUpdateResponse {
  detail: string;
}

export interface LogoutRequest {
  access_token: string;
  refresh_token: string;
}

export interface LogoutResponse {
  detail: string;
}

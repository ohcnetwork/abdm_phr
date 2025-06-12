export type Gender = "M" | "F" | "O";
export type KycStatus = "VERIFIED" | "PENDING";
export type BoolString = "true" | "false";

export type PhrProfilePartial = {
  health_id: string | null;
  name: string;
  first_name: string;
  middle_name: string | null;
  last_name: string | null;
  gender: Gender;
  date_of_birth: string;
  address: string;
  district: string;
  district_code: string;
  state: string;
  state_code: string;
  pincode: string;
  mobile: string;
  email: string | null;
  profile_photo: string | null;
};

export type PhrProfile = {
  abhaAddress: string;
  abhaNumber?: string;
  fullName: string;
  firstName: string;
  middleName: string | null;
  lastName: string | null;
  gender: Gender;
  dateOfBirth: string;
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
  kycStatus: KycStatus;
  status: string;
};

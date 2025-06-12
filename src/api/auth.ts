import {
  AbhaAddressExistsBody,
  AbhaAddressExistsResponse,
  AbhaAddressSuggestionsBody,
  AbhaAddressSuggestionsResponse,
  CheckAuthMethodsBody,
  CheckAuthMethodsResponse,
  EnrolAddressBody,
  SendOtpBody,
  SendOtpResponse,
  VerifyOtpBody,
  VerifyOtpResponse,
  VerifyPasswordBody,
  VerifyUserBody,
  VerifyUserResponse,
} from "@/types/auth";
import { API } from "@/utils/request/api";

// Register API routes
export const register = {
  sendOtp: API<SendOtpResponse, SendOtpBody>(
    "POST /phr/health_id/create/send_otp/",
  ),
  verifyOtp: API<VerifyOtpResponse, VerifyOtpBody>(
    "POST /phr/health_id/create/verify_otp/",
  ),
  abhaAddressSuggestions: API<
    AbhaAddressSuggestionsResponse,
    AbhaAddressSuggestionsBody
  >("POST /phr/health_id/create/abha_address_suggestion/"),
  checkAbhaExists: API<AbhaAddressExistsResponse, AbhaAddressExistsBody>(
    "POST /phr/health_id/create/abha_address_exists/",
  ),
  enrolAbhaAddress: API<VerifyUserResponse, EnrolAddressBody>(
    "POST /phr/health_id/create/enrol_abha_address/",
  ),
};

// Login API routes
export const login = {
  sendOtp: API<SendOtpResponse, SendOtpBody>(
    "POST /phr/health_id/login/send_otp/",
  ),
  verifyOtp: API<VerifyOtpResponse, VerifyOtpBody>(
    "POST /phr/health_id/login/verify/",
  ),
  verifyPassword: API<VerifyOtpResponse, VerifyPasswordBody>(
    "POST /phr/health_id/login/verify/",
  ),
  verifyUser: API<VerifyUserResponse, VerifyUserBody>(
    "POST /phr/health_id/login/verify_user/",
  ),
  chechAuthMethods: API<CheckAuthMethodsResponse, CheckAuthMethodsBody>(
    "POST /phr/health_id/login/check_auth_methods/",
  ),
};

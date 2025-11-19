export enum OtpPurpose {
  Registration = 0,
  Login = 1,
  PasswordReset = 2,
  TransactionApproval = 3,
  ProfileUpdate = 4,
  AccountActivation = 5
}

export interface OtpRequestDto {
  email: string;
  purpose: OtpPurpose;
}

export interface OtpVerifyDto {
  email: string;
  otpCode: string;
  purpose: OtpPurpose;
}



namespace OnlineBank.Core.Constants
{
    public static class ValidationMessages
    {
        public const string Required = "This field is required";
        public const string InvalidEmail = "Please enter a valid email address";
        public const string InvalidPhoneNumber = "Please enter a valid phone number";
        public const string InvalidAmount = "Please enter a valid amount";
        public const string MinLength = "Minimum length is {0} characters";
        public const string MaxLength = "Maximum length is {0} characters";
        public const string InvalidFormat = "Invalid format";
        
        // OTP related messages
        public const string OtpResendFailed = "Failed to resend OTP";
        public const string OtpResendSuccess = "OTP resent successfully";
        public const string OtpSendSuccess = "OTP sent successfully";
        public const string OtpSendFailed = "Failed to send OTP";
        public const string OtpVerifyFailed = "OTP verification failed";
        public const string OtpVerifySuccess = "OTP verified successfully";
        public const string SystemError = "System error occurred";
    }
}
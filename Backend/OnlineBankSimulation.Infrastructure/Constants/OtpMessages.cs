namespace OnlineBank.Infrastructure.Constants
{
    public static class OtpMessages
    {
        // OTP Send Messages
        public const string OtpSendSuccess = "✅ OTP sent successfully to {0}. Please check your email and enter the 6-digit code. Valid for 10 minutes.";
        public const string OtpSendFailed = "📧 Failed to send OTP. Please check your email address and try again.";
        
        // OTP Verify Messages
        public const string OtpVerifySuccess = "✅ Email verified successfully! You can now proceed with registration.";
        public const string OtpVerifyFailed = "❌ Invalid or expired OTP. Please check the code and try again, or request a new OTP.";
        
        // OTP Resend Messages
        public const string OtpResendSuccess = "✅ New OTP sent successfully! Please check your email.";
        public const string OtpResendFailed = "⏰ Please wait before requesting another OTP. You can request a new OTP after the rate limit period.";
        
        // OTP Validation Messages
        public const string OtpRequired = "OTP code is required";
        public const string OtpInvalidLength = "OTP must be exactly 6 digits";
        public const string OtpInvalidFormat = "OTP must contain only numbers";
        public const string EmailRequired = "Email address is required";
        public const string EmailInvalidFormat = "Please enter a valid email address";
    }
}
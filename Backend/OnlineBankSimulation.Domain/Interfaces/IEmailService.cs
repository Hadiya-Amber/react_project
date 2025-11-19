namespace OnlineBank.Core.Interfaces
{
    public interface IEmailService
    {
        Task<bool> SendOtpEmailAsync(string email, string otpCode, string purpose);
        Task<bool> SendWelcomeEmailAsync(string email, string fullName);
        Task<bool> SendAccountApprovalEmailAsync(string email, string fullName);
        Task<bool> SendAccountRejectionEmailAsync(string email, string fullName, string reason);
        Task<bool> SendAccountCreationEmailAsync(string email, string fullName, string accountNumber);
    }
}
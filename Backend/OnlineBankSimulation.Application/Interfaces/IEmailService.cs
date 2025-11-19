namespace OnlineBankSimulation.Application.Interfaces
{
    public interface IEmailService
    {
        Task<bool> SendOtpEmailAsync(string email, string otpCode, string purpose);
        Task<bool> SendWelcomeEmailAsync(string email, string fullName);
        Task<bool> SendAccountApprovalEmailAsync(string email, string fullName);
        Task<bool> SendAccountRejectionEmailAsync(string email, string fullName, string reason);
    }
}
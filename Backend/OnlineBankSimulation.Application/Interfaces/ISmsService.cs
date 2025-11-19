namespace OnlineBankSimulation.Application.Interfaces
{
    public interface ISmsService
    {
        Task<bool> SendOtpSmsAsync(string phoneNumber, string otpCode, string purpose);
        Task<bool> SendWelcomeSmsAsync(string phoneNumber, string fullName);
        Task<bool> SendAccountApprovalSmsAsync(string phoneNumber, string fullName);
    }
}
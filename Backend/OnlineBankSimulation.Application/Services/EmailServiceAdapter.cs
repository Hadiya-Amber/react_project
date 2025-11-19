using OnlineBankSimulation.Application.Interfaces;

namespace OnlineBankSimulation.Application.Services
{
    public class EmailServiceAdapter : IEmailService
    {
        private readonly EmailService _emailService;

        public EmailServiceAdapter(EmailService emailService)
        {
            _emailService = emailService;
        }

        public Task<bool> SendOtpEmailAsync(string email, string otpCode, string purpose)
        {
            return _emailService.SendOtpEmailAsync(email, otpCode, purpose);
        }

        public Task<bool> SendWelcomeEmailAsync(string email, string fullName)
        {
            return _emailService.SendWelcomeEmailAsync(email, fullName);
        }

        public Task<bool> SendAccountApprovalEmailAsync(string email, string fullName)
        {
            return _emailService.SendAccountApprovalEmailAsync(email, fullName);
        }

        public Task<bool> SendAccountRejectionEmailAsync(string email, string fullName, string reason)
        {
            return _emailService.SendAccountRejectionEmailAsync(email, fullName, reason);
        }
    }
}
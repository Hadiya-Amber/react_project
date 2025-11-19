using Microsoft.Extensions.Logging;
using OnlineBank.Core.Interfaces;

namespace OnlineBankSimulation.Application.Services
{
    public class SmsService : ISmsService
    {
        private readonly ILogger<SmsService> _logger;

        public SmsService(ILogger<SmsService> logger)
        {
            _logger = logger;
        }

        public async Task<bool> SendOtpSmsAsync(string phoneNumber, string otpCode, string purpose)
        {
            _logger.LogInformation("📱 SMS OTP: {OtpCode} sent to {PhoneNumber} for {Purpose}", otpCode, phoneNumber, purpose);
            await Task.Delay(100);
            return true;
        }

        public async Task<bool> SendWelcomeSmsAsync(string phoneNumber, string fullName)
        {
            _logger.LogInformation("📱 Welcome SMS sent to {PhoneNumber}", phoneNumber);
            await Task.Delay(100);
            return true;
        }

        public async Task<bool> SendAccountApprovalSmsAsync(string phoneNumber, string fullName)
        {
            _logger.LogInformation("📱 Approval SMS sent to {PhoneNumber}", phoneNumber);
            await Task.Delay(100);
            return true;
        }
    }
}
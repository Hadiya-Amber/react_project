using OnlineBank.Core.DTOs;
using OnlineBank.Core.Enums;

namespace OnlineBankSimulation.Application.Interfaces
{
    public interface IOtpService
    {
        Task<bool> SendOtpAsync(OtpRequestDto request);
        Task<bool> VerifyOtpAsync(OtpVerifyDto verify);
        Task<bool> ResendOtpAsync(string email, string phoneNumber, OtpPurpose purpose);
        Task CleanupExpiredOtpsAsync();
    }
}
using OnlineBank.Core.DTOs;
using OnlineBank.Core.Enums;

namespace OnlineBank.Core.Interfaces
{
    public interface IOtpService
    {
        Task<bool> SendOtpAsync(OtpRequestDto request);
        Task<bool> VerifyOtpAsync(OtpVerifyDto verify);
        Task<bool> ResendOtpAsync(string email, OtpPurpose purpose);
        Task<bool> IsEmailVerifiedAsync(string email, OtpPurpose purpose);
        Task CleanupExpiredOtpsAsync();
    }
}
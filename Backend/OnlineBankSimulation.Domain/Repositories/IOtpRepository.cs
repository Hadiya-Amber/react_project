using OnlineBank.Core.Models;
using OnlineBank.Core.Enums;

namespace OnlineBank.Core.Repositories
{
    public interface IOtpRepository : IGenericRepository<OtpVerification>
    {
        Task<OtpVerification?> GetValidOtpAsync(string email, OtpPurpose purpose);
        Task<bool> IsRateLimitExceededAsync(string email, OtpPurpose purpose, int maxAttempts = 3, int timeWindowMinutes = 15);
        Task<int> GetFailedAttemptsCountAsync(string email, OtpPurpose purpose, int timeWindowMinutes = 30);
        Task InvalidateOtpsAsync(string email, OtpPurpose purpose);
        Task<bool> IsEmailVerifiedAsync(string email, OtpPurpose purpose);
        Task CleanupExpiredOtpsAsync();
        Task UpdateAsync(OtpVerification otp);
#if DEBUG
        Task<string?> GetLatestOtpCodeAsync(string email);
#endif
    }
}
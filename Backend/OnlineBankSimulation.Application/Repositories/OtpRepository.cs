using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;
using OnlineBank.Core.Models;
using OnlineBank.Core.Enums;
using OnlineBank.Core.Repositories;
using OnlineBankSimulation.Application.Data;
using System.Data;
using Dapper;

namespace OnlineBankSimulation.Application.Repositories
{
    public class OtpRepository : GenericRepository<OtpVerification>, IOtpRepository
    {
        private readonly OnlineBankDbContext _context;
        private readonly string _connectionString;

        public OtpRepository(OnlineBankDbContext context, IConfiguration configuration) : base(context)
        {
            _context = context;
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
        }

        public async Task<OtpVerification?> GetValidOtpAsync(string email, OtpPurpose purpose)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                var parameters = new { Email = email, Purpose = (int)purpose };
                var otp = await connection.QueryFirstOrDefaultAsync<OtpVerification>(
                    "GetValidOtp", 
                    parameters, 
                    commandType: CommandType.StoredProcedure);
                return otp;
            }
            catch (Exception)
            {
                return await _context.OtpVerifications
                    .Where(o => o.Email == email &&
                               o.Purpose == purpose &&
                               !o.IsUsed &&
                               o.ExpiresAt > DateTime.UtcNow &&
                               !o.IsDeleted)
                    .OrderByDescending(o => o.CreatedAt)
                    .FirstOrDefaultAsync();
            }
        }

        public async Task<bool> IsRateLimitExceededAsync(string email, OtpPurpose purpose, int maxAttempts = 3, int timeWindowMinutes = 15)
        {
            var cutoffTime = DateTime.UtcNow.AddMinutes(-timeWindowMinutes);
            var recentOtpCount = await _context.OtpVerifications
                .CountAsync(o => o.Email == email &&
                           o.Purpose == purpose &&
                           o.CreatedAt > cutoffTime &&
                           !o.IsDeleted);

            return recentOtpCount >= maxAttempts;
        }

        public async Task<int> GetFailedAttemptsCountAsync(string email, OtpPurpose purpose, int timeWindowMinutes = 30)
        {
            var cutoffTime = DateTime.UtcNow.AddMinutes(-timeWindowMinutes);
            return await _context.OtpVerifications
                .Where(o => o.Email == email &&
                           o.Purpose == purpose &&
                           o.CreatedAt > cutoffTime &&
                           o.AttemptCount > 0 &&
                           !o.IsDeleted)
                .SumAsync(o => o.AttemptCount);
        }

        public async Task InvalidateOtpsAsync(string email, OtpPurpose purpose)
        {
            var existingOtps = await _context.OtpVerifications
                .Where(o => o.Email == email &&
                           o.Purpose == purpose &&
                           !o.IsUsed &&
                           !o.IsDeleted)
                .ToListAsync();

            foreach (var otp in existingOtps)
            {
                otp.IsUsed = true;
                otp.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        public async Task<bool> IsEmailVerifiedAsync(string email, OtpPurpose purpose)
        {
            // Check if there's a successfully used OTP for this email and purpose within last 30 minutes
            var cutoffTime = DateTime.UtcNow.AddMinutes(-30);
            return await _context.OtpVerifications
                .AnyAsync(o => o.Email == email &&
                              o.Purpose == purpose &&
                              o.IsUsed &&
                              o.UsedAt.HasValue &&
                              o.UsedAt.Value > cutoffTime &&
                              !o.IsDeleted);
        }

        public async Task CleanupExpiredOtpsAsync()
        {
            var expiredOtps = await _context.OtpVerifications
                .Where(o => o.ExpiresAt < DateTime.UtcNow || 
                           o.CreatedAt < DateTime.UtcNow.AddDays(-7))
                .ToListAsync();

            foreach (var otp in expiredOtps)
            {
                otp.IsDeleted = true;
                otp.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(OtpVerification otp)
        {
            _context.OtpVerifications.Update(otp);
            await _context.SaveChangesAsync();
        }

#if DEBUG
        public async Task<string?> GetLatestOtpCodeAsync(string email)
        {
            var latestOtp = await _context.OtpVerifications
                .Where(o => o.Email == email &&
                           !o.IsDeleted &&
                           o.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            return latestOtp?.OtpCode;
        }
#endif
    }
}
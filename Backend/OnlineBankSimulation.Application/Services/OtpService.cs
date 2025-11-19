using Microsoft.Extensions.Logging;
using OnlineBank.Core.DTOs;
using OnlineBank.Core.Models;
using OnlineBank.Core.Enums;
using OnlineBank.Core.Repositories;
using OnlineBank.Core.Constants;
using OnlineBankSimulation.Application.Interfaces;
using IOtpService = OnlineBank.Core.Interfaces.IOtpService;

namespace OnlineBankSimulation.Application.Services
{
    public class OtpService : IOtpService
    {
        private readonly IOtpRepository _otpRepository;
        private readonly IEmailService _emailService;
        private readonly ILogger<OtpService> _logger;

        public OtpService(
            IOtpRepository otpRepository,
            IEmailService emailService,
            ILogger<OtpService> logger)
        {
            _otpRepository = otpRepository;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<bool> SendOtpAsync(OtpRequestDto request)
        {
            try
            {
                // Check rate limiting
                if (await _otpRepository.IsRateLimitExceededAsync(request.Email, request.Purpose))
                {
                    _logger.LogWarning(ValidationMessages.OtpResendFailed);
                    return false;
                }

                // Invalidate existing OTPs
                await _otpRepository.InvalidateOtpsAsync(request.Email, request.Purpose);

                var otpCode = GenerateOtpCode();
                var otp = new OtpVerification
                {
                    UserId = request.UserId > 0 ? request.UserId : null,
                    Email = request.Email,
                    OtpCode = otpCode,
                    Purpose = request.Purpose,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(10),
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System"
                };

                await _otpRepository.AddAsync(otp);
                await _otpRepository.SaveChangesAsync();

                var message = string.Format(ValidationMessages.OtpSendSuccess, request.Email);
                await _emailService.SendWelcomeEmailAsync(request.Email, $"Your OTP code is: {otpCode}. This code will expire in 10 minutes.");

                _logger.LogInformation(message);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ValidationMessages.OtpSendFailed);
                return false;
            }
        }

        public async Task<bool> VerifyOtpAsync(OtpVerifyDto verify)
        {
            try
            {
                _logger.LogInformation($"🔍 Verifying OTP for {verify.Email}, Purpose: {verify.Purpose}, Code: {verify.OtpCode}");
                
                var otp = await _otpRepository.GetValidOtpAsync(verify.Email, verify.Purpose);
                if (otp == null)
                {
                    _logger.LogWarning($"❌ No valid OTP found for {verify.Email} with purpose {verify.Purpose}");
                    return false;
                }

                _logger.LogInformation($"🔍 Found OTP: Code={otp.OtpCode}, Expires={otp.ExpiresAt}, IsUsed={otp.IsUsed}, AttemptCount={otp.AttemptCount}");

                if (otp.OtpCode != verify.OtpCode)
                {
                    otp.AttemptCount++;
                    await _otpRepository.UpdateAsync(otp);
                    await _otpRepository.SaveChangesAsync();
                    _logger.LogWarning($"❌ OTP code mismatch for {verify.Email}. Expected: {otp.OtpCode}, Received: {verify.OtpCode}");
                    return false;
                }

                otp.IsUsed = true;
                otp.UsedAt = DateTime.UtcNow;
                await _otpRepository.UpdateAsync(otp);
                await _otpRepository.SaveChangesAsync();

                _logger.LogInformation($"✅ OTP verified successfully for {verify.Email}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"💥 Exception during OTP verification for {verify.Email}: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> ResendOtpAsync(string email, OtpPurpose purpose)
        {
            try
            {
                await _otpRepository.InvalidateOtpsAsync(email, purpose);
                
                var otpCode = GenerateOtpCode();
                var otp = new OtpVerification
                {
                    UserId = null, // For registration, user doesn't exist yet
                    Email = email,
                    OtpCode = otpCode,
                    Purpose = purpose,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(10),
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System"
                };

                await _otpRepository.AddAsync(otp);
                await _otpRepository.SaveChangesAsync();

                var message = $"Your OTP code is: {otpCode}. This code will expire in 10 minutes.";
                await _emailService.SendWelcomeEmailAsync(email, message);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resending OTP to {Email}", email);
                return false;
            }
        }

        public async Task<bool> IsEmailVerifiedAsync(string email, OtpPurpose purpose)
        {
            try
            {
                return await _otpRepository.IsEmailVerifiedAsync(email, purpose);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking email verification for {Email}", email);
                return false;
            }
        }

        public async Task CleanupExpiredOtpsAsync()
        {
            try
            {
                await _otpRepository.CleanupExpiredOtpsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up expired OTPs");
            }
        }

        private string GenerateOtpCode()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString();
        }
    }
}
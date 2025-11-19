using Microsoft.Extensions.Logging;
using OnlineBank.Core.Interfaces;
using System;
using System.Collections.Concurrent;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace OnlineBankSimulation.Application.Services
{
    public class PasswordResetService : IPasswordResetService
    {
        private readonly ILogger<PasswordResetService> _logger;
        private readonly ConcurrentDictionary<string, (string Code, DateTime Expiry)> _resetCodes = new();

        public PasswordResetService(ILogger<PasswordResetService> logger)
        {
            _logger = logger;
        }

        public async Task<string> GenerateResetCodeAsync(string email)
        {
            var normalizedEmail = email.ToLowerInvariant().Trim();
            var code = new Random().Next(100000, 999999).ToString();
            var expiry = DateTime.UtcNow.AddMinutes(15);
            
            _resetCodes.AddOrUpdate(normalizedEmail, (code, expiry), (key, oldValue) => (code, expiry));
            
            _logger.LogInformation("Generated reset code {Code} for email {Email} (normalized: {NormalizedEmail})", code, email, normalizedEmail);
            _logger.LogInformation("Total stored codes: {Count}", _resetCodes.Count);
            return await Task.FromResult(code);
        }

        public async Task<bool> ValidateResetCodeAsync(string email, string code)
        {
            var normalizedEmail = email.ToLowerInvariant().Trim();
            _logger.LogInformation("Validating reset code {Code} for email {Email} (normalized: {NormalizedEmail})", code, email, normalizedEmail);
            _logger.LogInformation("Total stored codes: {Count}", _resetCodes.Count);
            _logger.LogInformation("Stored emails: {Emails}", string.Join(", ", _resetCodes.Keys));
            
            if (_resetCodes.TryGetValue(normalizedEmail, out var storedData))
            {
                _logger.LogInformation("Found stored code {StoredCode} with expiry {Expiry}", storedData.Code, storedData.Expiry);
                
                if (storedData.Expiry > DateTime.UtcNow && storedData.Code == code)
                {
                    _resetCodes.TryRemove(normalizedEmail, out _);
                    _logger.LogInformation("Reset code validated successfully for {Email}", email);
                    return await Task.FromResult(true);
                }
                else
                {
                    _logger.LogWarning("Reset code validation failed - expired or incorrect code for {Email}", email);
                }
            }
            else
            {
                _logger.LogWarning("No reset code found for email {Email} (normalized: {NormalizedEmail})", email, normalizedEmail);
            }
            return await Task.FromResult(false);
        }

        public async Task<bool> SendResetEmailAsync(string email, string resetCode)
        {
            // For development - just log the reset code
            _logger.LogInformation("=== PASSWORD RESET EMAIL ===");
            _logger.LogInformation("To: {Email}", email);
            _logger.LogInformation("Subject: BankEase - Password Reset Code");
            _logger.LogInformation("Reset Code: {Code}", resetCode);
            _logger.LogInformation("Code expires in 15 minutes");
            _logger.LogInformation("==============================");
            
            await Task.Delay(100); // Simulate email sending delay
            return true;
        }
    }
}
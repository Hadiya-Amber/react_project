using Microsoft.AspNetCore.Mvc;
using OnlineBank.Core.Interfaces;

namespace OnlineBankSimulation.API.Controllers
{
    [ApiController]
    [Route("api/password-reset")]
    public class PasswordResetController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IPasswordResetService _passwordResetService;
        private readonly ILogger<PasswordResetController> _logger;

        public PasswordResetController(IUserService userService, IPasswordResetService passwordResetService, ILogger<PasswordResetController> logger)
        {
            _userService = userService;
            _passwordResetService = passwordResetService;
            _logger = logger;
        }

        [HttpPost("request")]
        public async Task<IActionResult> RequestPasswordReset([FromForm] string email)
        {
            try
            {
                var user = await _userService.GetByEmailAsync(email);
                if (user == null)
                {
                    // Return success even if user doesn't exist for security
                    return Ok(new { success = true, message = "If the email exists, a reset code will be sent." });
                }

                var resetCode = await _passwordResetService.GenerateResetCodeAsync(email);
                var emailSent = await _passwordResetService.SendResetEmailAsync(email, resetCode);

                if (emailSent)
                {
                    return Ok(new { success = true, message = "Password reset code sent to your email" });
                }
                else
                {
                    return StatusCode(500, new { success = false, message = "Failed to send reset email" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error requesting password reset for email {Email}", email);
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpPost("reset")]
        public async Task<IActionResult> ResetPassword([FromForm] string email, [FromForm] string code, [FromForm] string newPassword)
        {
            try
            {
                var isValidCode = await _passwordResetService.ValidateResetCodeAsync(email, code);
                if (!isValidCode)
                {
                    return BadRequest(new { success = false, message = "Invalid or expired reset code" });
                }

                var resetSuccess = await _userService.ResetPasswordAsync(email, newPassword);
                if (resetSuccess)
                {
                    return Ok(new { success = true, message = "Password reset successful" });
                }
                else
                {
                    return BadRequest(new { success = false, message = "Failed to reset password" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password for email {Email}", email);
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }
    }
}
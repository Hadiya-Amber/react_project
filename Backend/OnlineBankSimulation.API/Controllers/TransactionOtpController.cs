using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBank.Core.Common;
using OnlineBank.Core.DTOs;
using OnlineBank.Core.Enums;
using OnlineBank.Core.Interfaces;
using System.Security.Claims;

namespace OnlineBank.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TransactionOtpController : ControllerBase
    {
        private readonly IOtpService _otpService;
        private readonly IUserService _userService;
        private readonly ILogger<TransactionOtpController> _logger;

        public TransactionOtpController(IOtpService otpService, IUserService userService, ILogger<TransactionOtpController> logger)
        {
            _otpService = otpService;
            _userService = userService;
            _logger = logger;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendTransactionOtp([FromForm] decimal amount)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));
                }

                var user = await _userService.GetByIdAsync(userId);
                if (user == null)
                {
                    return BadRequest(ApiResponse<object>.FailResponse("User not found"));
                }

                var otpRequest = new OtpRequestDto
                {
                    Email = user.Email,
                    Purpose = OtpPurpose.TransactionApproval,
                    UserId = userId
                };

                var result = await _otpService.SendOtpAsync(otpRequest);
                if (!result)
                {
                    return BadRequest(ApiResponse<object>.FailResponse("Failed to send transaction OTP"));
                }

                return Ok(ApiResponse<object>.SuccessResponse(null, $"Transaction OTP sent to {user.Email}"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending transaction OTP");
                return StatusCode(500, ApiResponse<object>.FailResponse("Failed to send OTP"));
            }
        }

        [HttpPost("verify")]
        public async Task<IActionResult> VerifyTransactionOtp([FromForm] string otpCode)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));
                }

                var user = await _userService.GetByIdAsync(userId);
                if (user == null)
                {
                    return BadRequest(ApiResponse<object>.FailResponse("User not found"));
                }

                var verifyDto = new OtpVerifyDto
                {
                    Email = user.Email,
                    OtpCode = otpCode,
                    Purpose = OtpPurpose.TransactionApproval
                };

                var result = await _otpService.VerifyOtpAsync(verifyDto);
                if (!result)
                {
                    return BadRequest(ApiResponse<object>.FailResponse("Invalid or expired OTP"));
                }

                return Ok(ApiResponse<object>.SuccessResponse(null, "Transaction OTP verified"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying transaction OTP");
                return StatusCode(500, ApiResponse<object>.FailResponse("OTP verification failed"));
            }
        }
    }
}
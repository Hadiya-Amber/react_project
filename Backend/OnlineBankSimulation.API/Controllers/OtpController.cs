using Microsoft.AspNetCore.Mvc;
using OnlineBank.Core.Common;
using OnlineBank.Core.DTOs;
using OnlineBank.Core.Interfaces;
using OnlineBank.Core.Constants;
using System.Linq;

namespace OnlineBank.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OtpController : ControllerBase
    {
        private readonly IOtpService _otpService;
        private readonly IUserService _userService;
        private readonly ILogger<OtpController> _logger;

        public OtpController(IOtpService otpService, IUserService userService, ILogger<OtpController> logger)
        {
            _otpService = otpService;
            _userService = userService;
            _logger = logger;
        }

        /// <summary>
        /// Send OTP for registration verification
        /// </summary>
        [HttpPost("send")]
        public async Task<IActionResult> SendOtp([FromForm] OtpRequestDto request)
        {
            try
            {
                _logger.LogInformation($"🔍 OTP Send Request - Email: {request.Email}, Purpose: {request.Purpose}");
                
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                    _logger.LogWarning($"❌ Model validation failed: {string.Join(", ", errors)}");
                    return BadRequest(ApiResponse<object>.FailResponse($"❌ {string.Join(", ", errors)}"));
                }

                _logger.LogInformation($"🔍 Checking if email {request.Email} is already registered...");
                // Check if email is already registered
                var existingUser = await _userService.GetByEmailAsync(request.Email);
                if (existingUser != null)
                {
                    _logger.LogWarning($"❌ Email {request.Email} is already registered");
                    return BadRequest(ApiResponse<object>.FailResponse(
                        "This email is already registered. Please login instead or use a different email."));
                }
                _logger.LogInformation($"✅ Email {request.Email} is not registered, proceeding...");

                _logger.LogInformation($"🔍 Checking if email {request.Email} is already verified for purpose {request.Purpose}...");
                //Check if already verified for same purpose
                var isAlreadyVerified = await _otpService.IsEmailVerifiedAsync(request.Email, request.Purpose);
                if (isAlreadyVerified)
                {
                    var purposeText = request.Purpose.ToString().ToLower();
                    _logger.LogWarning($"❌ Email {request.Email} is already verified for {purposeText}");
                    return BadRequest(ApiResponse<object>.FailResponse(
                        $"This email is already verified for {purposeText}. Please proceed with {purposeText} or use a different email."));
                }
                _logger.LogInformation($"✅ Email {request.Email} is not verified for {request.Purpose}, proceeding to send OTP...");

                var result = await _otpService.SendOtpAsync(request);
                
                if (!result)
                    return BadRequest(ApiResponse<object>.FailResponse(ValidationMessages.OtpSendFailed));

                return Ok(ApiResponse<object>.SuccessResponse(null, 
                    string.Format(ValidationMessages.OtpSendSuccess, request.Email)));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending OTP");
                return StatusCode(500, ApiResponse<object>.FailResponse("Failed to send OTP"));
            }
        }

        /// <summary>
        /// Verify OTP before registration - Returns verification token
        /// </summary>
        [HttpPost("verify")]
        public async Task<IActionResult> VerifyOtp([FromForm] OtpVerifyDto verify)
        {
            try
            {
                _logger.LogInformation($"🔍 OTP Verification Request - Email: {verify.Email}, OTP: {verify.OtpCode}, Purpose: {verify.Purpose}");
                
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                    _logger.LogWarning($"❌ Model validation failed: {string.Join(", ", errors)}");
                    return BadRequest(ApiResponse<object>.FailResponse($"❌ {string.Join(", ", errors)}"));
                }

                // Check if email is already registered
                var existingUser = await _userService.GetByEmailAsync(verify.Email);
                if (existingUser != null)
                {
                    _logger.LogWarning($"❌ Attempted OTP verification for already registered email: {verify.Email}");
                    return BadRequest(ApiResponse<object>.FailResponse(
                        "This email is already registered. Please login instead."));
                }

                var result = await _otpService.VerifyOtpAsync(verify);
                
                if (!result)
                {
                    _logger.LogWarning($"❌ OTP verification failed for {verify.Email} with code {verify.OtpCode}");
                    return BadRequest(ApiResponse<object>.FailResponse(ValidationMessages.OtpVerifyFailed));
                }

                _logger.LogInformation($"✅ OTP verified successfully for {verify.Email}");
                
                //OTP verified - user can now register
                var response = new 
                {
                    Email = verify.Email,
                    Message = "Email verified successfully! You can now proceed with registration.",
                    CanProceedToRegistration = true
                };

                return Ok(ApiResponse<object>.SuccessResponse(response, ValidationMessages.OtpVerifySuccess));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"💥 Exception during OTP verification for {verify.Email}");
                return StatusCode(500, ApiResponse<object>.FailResponse("OTP verification failed"));
            }
        }



        /// <summary>
        /// Resend OTP
        /// </summary>
        [HttpPost("resend")]
        public async Task<IActionResult> ResendOtp([FromForm] OtpRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                    return BadRequest(ApiResponse<object>.FailResponse($"❌ {string.Join(", ", errors)}"));
                }

                var result = await _otpService.ResendOtpAsync(request.Email, request.Purpose);
                
                if (!result)
                    return BadRequest(ApiResponse<object>.FailResponse(ValidationMessages.OtpResendFailed));

                return Ok(ApiResponse<object>.SuccessResponse(null, ValidationMessages.OtpResendSuccess));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resending OTP");
                return StatusCode(500, ApiResponse<object>.FailResponse("Failed to resend OTP"));
            }
        }
    }
}
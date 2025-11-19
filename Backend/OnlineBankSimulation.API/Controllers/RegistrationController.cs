using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBank.Core.Common;
using OnlineBank.Core.DTOs;
using OnlineBank.Core.DTOs.UserDtos;
using OnlineBank.Core.Services;
using System.Linq;

namespace OnlineBank.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegistrationController : ControllerBase
    {
        private readonly IRegistrationService _registrationService;
        private readonly ILogger<RegistrationController> _logger;

        public RegistrationController(IRegistrationService registrationService, ILogger<RegistrationController> logger)
        {
            _registrationService = registrationService;
            _logger = logger;
        }

        /// <summary>
        /// Customer registration (Step 2 after OTP verification via /api/otp/verify)
        /// </summary>
        [HttpPost("customer")]
        public async Task<IActionResult> RegisterCustomer([FromForm] SimpleCustomerRegistrationDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Count > 0)
                    .SelectMany(x => x.Value.Errors.Select(e => e.ErrorMessage))
                    .ToList();
                
                return BadRequest(ApiResponse<object>.FailResponse(
                    $"❌ Validation failed: {string.Join(", ", errors)}"));
            }

            var result = await _registrationService.RegisterCustomerAsync(dto);
            
            if (!result.Success)
                return BadRequest(ApiResponse<object>.FailResponse(result.Message));

            return Ok(ApiResponse<UserResponseDto>.SuccessResponse(result.Data, result.Message));
        }

        /// <summary>
        /// Admin creates branch manager (auto-approved)
        /// </summary>
        [HttpPost("branch-manager")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateBranchManager([FromForm] CreateEmployeeDto dto)
        {
            _logger.LogInformation("Received branch manager creation request: {@Dto}", dto);
            
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Count > 0)
                    .SelectMany(x => x.Value.Errors.Select(e => e.ErrorMessage))
                    .ToList();
                
                _logger.LogWarning("Validation failed: {Errors}", string.Join(", ", errors));
                return BadRequest(ApiResponse<object>.FailResponse(
                    $"❌ Validation failed: {string.Join(", ", errors)}"));
            }

            var result = await _registrationService.CreateEmployeeAsync(dto);
            
            if (!result.Success)
            {
                _logger.LogWarning("Branch manager creation failed: {Message}", result.Message);
                return BadRequest(ApiResponse<object>.FailResponse(result.Message));
            }

            return Ok(ApiResponse<UserResponseDto>.SuccessResponse(result.Data, result.Message));
        }

        /// <summary>
        /// Branch manager changes password (must use temp password first)
        /// </summary>
        [HttpPost("change-password")]
        [Authorize(Roles = "BranchManager")]
        public async Task<IActionResult> ChangePassword([FromForm] ChangePasswordDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Count > 0)
                    .SelectMany(x => x.Value.Errors.Select(e => e.ErrorMessage))
                    .ToList();
                
                return BadRequest(ApiResponse<object>.FailResponse(
                    $"❌ Validation failed: {string.Join(", ", errors)}"));
            }

            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));

                var result = await _registrationService.ChangePasswordAsync(userId, dto);
                
                if (!result.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));

                return Ok(ApiResponse<object>.SuccessResponse(result.Data, result.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password");
                return StatusCode(500, ApiResponse<object>.FailResponse($"Password change failed: {ex.Message}"));
            }
        }

    }
}
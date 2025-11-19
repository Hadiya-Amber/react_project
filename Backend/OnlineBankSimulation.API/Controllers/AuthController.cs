using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using OnlineBank.Core.Common;
using OnlineBank.Core.DTOs.UserDtos;
using OnlineBank.Core.Interfaces;
using System.Security.Claims;
using System.Text.Json;

namespace OnlineBank.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUserService _userService;

        public AuthController(IAuthService authService, IUserService userService)
        {
            _authService = authService;
            _userService = userService;
        }

        [HttpPost("login")]
        [Produces("application/json")]
        public async Task<IActionResult> Login([FromForm] string email, [FromForm] string password)
        {
            var loginDto = new LoginDto { Email = email, Password = password };
            
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
                return BadRequest(ApiResponse<object>.FailResponse("Email and password are required"));

            var result = await _authService.LoginAsync(loginDto);
            
            if (!result.Success)
                return Unauthorized(ApiResponse<object>.FailResponse(result.Message));

            return Ok(ApiResponse<object>.SuccessResponse(new { 
                Token = result.Token, 
                User = result.User 
            }, result.Message));
        }

        [HttpPost("login-json")]
        [Consumes("application/json")]
        [Produces("application/json")]
        public async Task<IActionResult> LoginJson([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.FailResponse("Validation failed", ModelState));

            var result = await _authService.LoginAsync(loginDto);
            
            if (!result.Success)
                return Unauthorized(ApiResponse<object>.FailResponse(result.Message));

            return Ok(ApiResponse<object>.SuccessResponse(new { 
                Token = result.Token, 
                User = result.User 
            }, result.Message));
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));

                var user = await _userService.GetByIdAsync(userId);
                if (user == null)
                    return NotFound(ApiResponse<object>.FailResponse("User not found"));

                return Ok(ApiResponse<object>.SuccessResponse(user, "Profile retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.FailResponse("Internal server error"));
            }
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] JsonElement requestData)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));

                var dto = new UpdateProfileDto
                {
                    FullName = requestData.TryGetProperty("fullName", out var fullName) ? fullName.GetString() ?? "" : "",
                    PhoneNumber = requestData.TryGetProperty("phoneNumber", out var phoneNumber) ? phoneNumber.GetString() ?? "" : "",
                    DateOfBirth = requestData.TryGetProperty("dateOfBirth", out var dateOfBirth) && dateOfBirth.ValueKind != JsonValueKind.Null ? DateTime.Parse(dateOfBirth.GetString()) : null,
                    Address = requestData.TryGetProperty("address", out var address) ? address.GetString() ?? "" : "",
                    City = requestData.TryGetProperty("city", out var city) ? city.GetString() ?? "" : "",
                    State = requestData.TryGetProperty("state", out var state) ? state.GetString() ?? "" : "",
                    PostalCode = requestData.TryGetProperty("postalCode", out var postalCode) ? postalCode.GetString() ?? "" : "",
                    Country = requestData.TryGetProperty("country", out var country) ? country.GetString() ?? "" : "",
                    Occupation = requestData.TryGetProperty("occupation", out var occupation) ? occupation.GetString() ?? "" : "",
                    MonthlyIncome = requestData.TryGetProperty("monthlyIncome", out var monthlyIncome) && monthlyIncome.ValueKind != JsonValueKind.Null ? monthlyIncome.GetDecimal() : null,
                    EmergencyContactName = requestData.TryGetProperty("emergencyContactName", out var emergencyContactName) ? emergencyContactName.GetString() ?? "" : "",
                    EmergencyContactPhone = requestData.TryGetProperty("emergencyContactPhone", out var emergencyContactPhone) ? emergencyContactPhone.GetString() ?? "" : ""
                };

                var result = await _userService.UpdateProfileAsync(userId, dto);
                if (!result.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));

                return Ok(ApiResponse<object>.SuccessResponse(result.Data, "Profile updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.FailResponse($"Internal server error: {ex.Message}"));
            }
        }
    }
}
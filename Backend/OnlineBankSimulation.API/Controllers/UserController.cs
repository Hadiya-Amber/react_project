using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBank.Core.Common;
using OnlineBank.Core.Constants;
using OnlineBank.Core.DTOs.UserDtos;
using OnlineBank.Core.Interfaces;
using System;
using System.Threading.Tasks;

namespace OnlineBank.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        // Get all users 
        [HttpGet]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _userService.GetAllAsync(1, 100);
                return Ok(ApiResponse<object>.SuccessResponse(users, "Users retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.FailResponse($"{UserMessages.UnexpectedError}: {ex.Message}"));
            }
        }

        // Get user by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            try
            {
                var user = await _userService.GetByIdAsync(id);
                if (user == null)
                    return NotFound(ApiResponse<object>.FailResponse(UserMessages.UserNotFound));

                return Ok(ApiResponse<object>.SuccessResponse(user, "User retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.FailResponse($"{UserMessages.UnexpectedError}: {ex.Message}"));
            }
        }

        // Get user for editing
        [HttpGet("{id}/edit")]
        public async Task<IActionResult> GetUserForEdit(int id)
        {
            try
            {
                var user = await _userService.GetByIdAsync(id);
                if (user == null)
                    return NotFound(ApiResponse<object>.FailResponse(UserMessages.UserNotFound));

                return Ok(ApiResponse<object>.SuccessResponse(user, "User data for editing retrieved"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.FailResponse($"{UserMessages.UnexpectedError}: {ex.Message}"));
            }
        }

        // Update user details
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromForm] UserUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<object>.FailResponse("Validation failed", ModelState));

                var updated = await _userService.UpdateAsync(id, dto);
                if (updated == null)
                    return NotFound(ApiResponse<object>.FailResponse(UserMessages.UserNotFound));

                return Ok(ApiResponse<object>.SuccessResponse(updated, UserMessages.UserUpdated));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.FailResponse($"{UserMessages.UnexpectedError}: {ex.Message}"));
            }
        }

        // Soft delete user
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var result = await _userService.DeleteAsync(id);
                if (!result)
                    return NotFound(ApiResponse<object>.FailResponse(UserMessages.UserNotFound));

                return Ok(ApiResponse<object>.SuccessResponse(new { }, UserMessages.UserDeleted));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.FailResponse($"{UserMessages.UnexpectedError}: {ex.Message}"));
            }
        }
    }
}

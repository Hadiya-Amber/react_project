using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBank.Core.Common;
using OnlineBank.Core.Constants;
using OnlineBank.Core.DTOs.BranchDtos;
using OnlineBank.Core.Interfaces;
using System.Security.Claims;

namespace OnlineBank.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BranchController : ControllerBase
    {
        private readonly IBranchService _branchService;
        private readonly ILogger<BranchController> _logger;

        public BranchController(IBranchService branchService, ILogger<BranchController> logger)
        {
            _branchService = branchService;
            _logger = logger;
        }

        // 1. Admin creates branches
        [HttpPost("create")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateBranch([FromForm] CreateBranchDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.FailResponse("Validation failed", ModelState));

            try
            {
                var result = await _branchService.CreateAsync(dto);
                if (!result.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));

                _logger.LogInformation("Branch {BranchCode} created successfully", dto.BranchCode);
                return Ok(ApiResponse<object>.SuccessResponse(result, BranchMessages.BranchCreated));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating branch");
                return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while creating branch"));
            }
        }

        // 2. Get all branches (for customers and public)
        [HttpGet("all")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllBranches()
        {
            try
            {
                var branches = await _branchService.GetAllActiveAsync();
                if (!branches.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(branches.Message));
                return Ok(ApiResponse<IEnumerable<BranchReadDto>>.SuccessResponse(branches.Data, "Branches retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving branches");
                return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while retrieving branches"));
            }
        }

        // Get branches by type (for customers and public)
        [HttpGet("type/{branchType}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBranchesByType(int branchType)
        {
            try
            {
                var result = await _branchService.GetBranchesByTypeAsync(branchType);
                if (!result.Success)
                    return Ok(ApiResponse<object>.SuccessResponse(new List<object>(), result.Message));

                return Ok(ApiResponse<object>.SuccessResponse(result.Data, result.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving branches by type {BranchType}", branchType);
                return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while retrieving branches"));
            }
        }

        // 3. Get branch accounts (BranchManager and Admin)
        [HttpGet("{id}/accounts")]
        [Authorize(Roles = "BranchManager,Admin")]
        public async Task<IActionResult> GetBranchAccounts(int id)
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var userBranchId = User.FindFirst("BranchId")?.Value;

                // Branch-level access control - BranchManager can only see their own branch, Admin can see all
                if (userRole == "BranchManager" && userBranchId != id.ToString())
                    return Forbid(BranchMessages.UnauthorizedBranchAccess);

                var result = await _branchService.GetBranchAccountsAsync(id);
                if (!result.Success)
                    return Ok(ApiResponse<object>.SuccessResponse(new List<object>(), result.Message));

                return Ok(ApiResponse<object>.SuccessResponse(result.Data, result.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving accounts for branch {Id}", id);
                return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while retrieving branch accounts"));
            }
        }

        // Get branch details (for customers and public)
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBranchById(int id)
        {
            try
            {
                var result = await _branchService.GetByIdAsync(id);
                if (!result.Success)
                    return NotFound(ApiResponse<object>.FailResponse(result.Message));

                return Ok(ApiResponse<object>.SuccessResponse(result.Data, "Branch details retrieved"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving branch {Id}", id);
                return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while retrieving branch"));
            }
        }

        // 4. Update branch (Admin only) - Standard REST endpoint
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateBranch(int id, [FromBody] CreateBranchDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.FailResponse("Validation failed", ModelState));

            try
            {
                // Convert CreateBranchDto to UpdateBranchDto
                var updateDto = new UpdateBranchDto
                {
                    BranchName = dto.BranchName,
                    BranchCode = dto.BranchCode,
                    Address = dto.Address,
                    City = dto.City,
                    State = dto.State,
                    IFSCCode = dto.IFSCCode,
                    PostalCode = dto.PostalCode,
                    PhoneNumber = dto.PhoneNumber,
                    Email = dto.Email,
                    BranchType = dto.BranchType,
                    IsActive = dto.IsActive
                };

                var result = await _branchService.UpdateAsync(id, updateDto);
                if (!result.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));

                _logger.LogInformation("Branch {Id} updated successfully", id);
                return Ok(ApiResponse<object>.SuccessResponse(result, BranchMessages.BranchUpdated));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating branch {Id}", id);
                return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while updating branch"));
            }
        }

        // Update branch with form data (Admin only) - Alternative endpoint
        [HttpPut("{id}/update")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateBranchWithForm(int id, [FromForm] UpdateBranchDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.FailResponse("Validation failed", ModelState));

            try
            {
                var result = await _branchService.UpdateAsync(id, dto);
                if (!result.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));

                _logger.LogInformation("Branch {Id} updated successfully", id);
                return Ok(ApiResponse<object>.SuccessResponse(result, BranchMessages.BranchUpdated));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating branch {Id}", id);
                return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while updating branch"));
            }
        }

        // Check if branch has a manager (Admin only)
        [HttpGet("{id}/manager-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetBranchManagerStatus(int id)
        {
            try
            {
                var hasBranchManager = await _branchService.HasBranchManagerAsync(id);
                return Ok(ApiResponse<object>.SuccessResponse(new { hasBranchManager }, "Branch manager status retrieved"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking branch manager status for branch {Id}", id);
                return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while checking branch manager status"));
            }
        }

        // Get all branch manager statuses at once (Admin only)
        [HttpGet("all-manager-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllBranchManagerStatus()
        {
            try
            {
                var branches = await _branchService.GetAllActiveAsync();
                if (!branches.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(branches.Message));

                var managerStatuses = new List<object>();
                foreach (var branch in branches.Data)
                {
                    var hasBranchManager = await _branchService.HasBranchManagerAsync(branch.Id);
                    managerStatuses.Add(new { branchId = branch.Id, hasBranchManager });
                }

                return Ok(ApiResponse<object>.SuccessResponse(managerStatuses, "All branch manager statuses retrieved"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking all branch manager statuses");
                return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while checking branch manager statuses"));
            }
        }

        // Get comprehensive branch details (Admin only)
        [HttpGet("{id}/details")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetBranchDetails(int id)
        {
            try
            {
                var branchDetail = await _branchService.GetBranchDetailAsync(id);
                if (branchDetail == null)
                    return NotFound(ApiResponse<object>.FailResponse("Branch not found"));

                return Ok(ApiResponse<object>.SuccessResponse(branchDetail, "Branch details retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving branch details for branch {Id}", id);
                return StatusCode(500, ApiResponse<object>.FailResponse("An error occurred while retrieving branch details"));
            }
        }


    }
}
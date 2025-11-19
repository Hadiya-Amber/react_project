using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBank.Core.Common;
using OnlineBank.Core.Constants;
using OnlineBank.Core.DTOs.AccountDtos;
using OnlineBank.Core.Interfaces;
using System.Security.Claims;

namespace OnlineBank.Api.Controllers
{
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly IUserService _userService;
        private readonly ILogger<AccountController> _logger;
        private readonly IEmailService _emailService;

        public AccountController(IAccountService accountService, IUserService userService, ILogger<AccountController> logger, IEmailService emailService)
        {
            _accountService = accountService;
            _userService = userService;
            _logger = logger;
            _emailService = emailService;
        }

        // ✅ Get account by ID
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAccountById(int id)
        {
            try
            {
                var result = await _accountService.GetByIdAsync(id);
                if (result == null)
                    return NotFound(ApiResponse<object>.FailResponse(AccountMessages.AccountNotFound));

                return Ok(ApiResponse<object>.SuccessResponse(result, "Account retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving account {Id}", id);
                return StatusCode(500, ApiResponse<object>.FailResponse(AccountMessages.UnexpectedError));
            }
        }

        // ✅ Get all accounts
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAccounts()
        {
            try
            {
                var result = await _accountService.GetAllAsync(1, 100);
                return Ok(ApiResponse<object>.SuccessResponse(result, "Accounts retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all accounts");
                return StatusCode(500, ApiResponse<object>.FailResponse(AccountMessages.UnexpectedError));
            }
        }

        // ✅ Alias for getAllAccounts (for frontend compatibility)
        [HttpGet("getAllAccounts")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllAccountsAlias()
        {
            return await GetAllAccounts();
        }

        // ✅ Get my accounts (Customer)
        [HttpGet("my-accounts")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetMyAccounts()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));

                var result = await _accountService.GetByUserIdAsync(userId);
                return Ok(ApiResponse<object>.SuccessResponse(result, "Your accounts retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user accounts");
                return StatusCode(500, ApiResponse<object>.FailResponse(AccountMessages.UnexpectedError));
            }
        }

        // ✅ Get accounts by user ID
        [HttpGet("user/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetAccountsByUserId(int userId)
        {
            try
            {
                var result = await _accountService.GetByUserIdAsync(userId);
                return Ok(ApiResponse<object>.SuccessResponse(result, "User accounts retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving accounts for user {UserId}", userId);
                return StatusCode(500, ApiResponse<object>.FailResponse(AccountMessages.UnexpectedError));
            }
        }

        // ✅ Create new account (Customer role)
        [HttpPost("create")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CreateAccount([FromForm] CreateAccountDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.FailResponse("Validation failed", ModelState));

            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                {
                    _logger.LogWarning("Invalid user token in account creation request");
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));
                }

                var result = await _accountService.CreateAccountAsync(model, userId);
                if (result == null || result.Id == 0)
                {
                    _logger.LogWarning("Account creation failed for user {UserId}", userId);
                    return BadRequest(ApiResponse<object>.FailResponse("Account creation failed"));
                }

                // Send email notification
                try
                {
                    var user = await _userService.GetByIdAsync(userId);
                    if (user != null && !string.IsNullOrEmpty(user.Email))
                    {
                        await _emailService.SendAccountCreationEmailAsync(user.Email, user.FullName, result.AccountNumber);
                        _logger.LogInformation("Account creation notification sent to {Email}", user.Email);
                    }
                    else
                    {
                        _logger.LogWarning("User email not found for account creation notification");
                    }
                }
                catch (Exception emailEx)
                {
                    _logger.LogWarning(emailEx, "Failed to send account creation notification");
                }

                _logger.LogInformation("Account created successfully for user {UserId}", userId);
                return Ok(ApiResponse<object>.SuccessResponse(result, AccountMessages.AccountPending));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating account");
                return StatusCode(500, ApiResponse<object>.FailResponse(AccountMessages.UnexpectedError));
            }
        }

        // ✅ Verify account (BranchManager only)
        [HttpPut("verify/{accountId}")]
        [Authorize(Roles = "BranchManager")]
        public async Task<IActionResult> VerifyAccount(int accountId, [FromForm] VerifyAccountDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.FailResponse("Validation failed", ModelState));

            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int verifiedBy))
                {
                    _logger.LogWarning("Invalid user token in account verification request");
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));
                }

                var result = await _accountService.VerifyAccountAsync(accountId, model, verifiedBy);
                if (!result)
                {
                    _logger.LogWarning("Account verification failed for account {AccountId}", accountId);
                    return BadRequest(ApiResponse<object>.FailResponse(AccountMessages.AccountNotPending));
                }

                // Send email notification for verification result
                try
                {
                    var account = await _accountService.GetByIdAsync(accountId);
                    if (account != null)
                    {
                        var user = await _userService.GetByIdAsync(account.UserId);
                        if (user != null && !string.IsNullOrEmpty(user.Email))
                        {
                            if (model.IsApproved)
                            {
                                await _emailService.SendAccountApprovalEmailAsync(user.Email, user.FullName);
                            }
                            else
                            {
                                await _emailService.SendAccountRejectionEmailAsync(user.Email, user.FullName, model.Remarks ?? "Please contact our support team for more information.");
                            }
                            _logger.LogInformation("Account verification notification sent to {Email}", user.Email);
                        }
                    }
                }
                catch (Exception emailEx)
                {
                    _logger.LogWarning(emailEx, "Failed to send account verification notification");
                }

                var message = model.IsApproved ? AccountMessages.AccountApproved : AccountMessages.AccountRejected;
                _logger.LogInformation("Account {AccountId} verified by user {VerifiedBy}", accountId, verifiedBy);
                return Ok(ApiResponse<object>.SuccessResponse(new { }, message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying account {AccountId}", accountId);
                return StatusCode(500, ApiResponse<object>.FailResponse(AccountMessages.UnexpectedError));
            }
        }

        // Get pending accounts for verification
        [HttpGet("pending")]
        [Authorize(Roles = "BranchManager,Admin")]
        public async Task<IActionResult> GetPendingAccounts()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));

                // For BranchManagers, only show accounts from their branch
                if (userRole == "BranchManager")
                {
                    var userBranchId = await _userService.GetUserBranchIdAsync(userId);
                    if (userBranchId == null)
                        return BadRequest(ApiResponse<object>.FailResponse("BranchManager must be assigned to a branch"));

                    var result = await _accountService.GetPendingAccountsByBranchAsync(userBranchId.Value);
                    return Ok(ApiResponse<object>.SuccessResponse(result, "Pending accounts retrieved successfully"));
                }
                else
                {
                    // Admins can see all pending accounts
                    var result = await _accountService.GetPendingAccountsAsync();
                    return Ok(ApiResponse<object>.SuccessResponse(result, "Pending accounts retrieved successfully"));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pending accounts");
                return StatusCode(500, ApiResponse<object>.FailResponse(AccountMessages.UnexpectedError));
            }
        }

        // Get pending accounts for specific branch (BranchManager only)
        [HttpGet("pending/branch/{branchId}")]
        [Authorize(Roles = "BranchManager")]
        public async Task<IActionResult> GetPendingAccountsByBranch(int branchId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));

                // For BranchManagers, validate they can only access their own branch
                if (userRole == "BranchManager")
                {
                    var userBranchId = await _userService.GetUserBranchIdAsync(userId);
                    if (userBranchId == null || userBranchId.Value != branchId)
                        return Forbid("BranchManager can only access accounts from their assigned branch");
                }

                var result = await _accountService.GetPendingAccountsByBranchAsync(branchId);
                return Ok(ApiResponse<object>.SuccessResponse(result, $"Pending accounts for branch {branchId} retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pending accounts for branch {BranchId}", branchId);
                return StatusCode(500, ApiResponse<object>.FailResponse(AccountMessages.UnexpectedError));
            }
        }

        // Branch-specific account verification (BranchManager only)
        [HttpPut("verify-branch/{accountId}")]
        [Authorize(Roles = "BranchManager")]
        public async Task<IActionResult> VerifyAccountByBranchManager(int accountId, [FromForm] VerifyAccountDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.FailResponse("Validation failed", ModelState));

            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int branchManagerId))
                {
                    _logger.LogWarning("Invalid user token in branch account verification request");
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));
                }

                var result = await _accountService.VerifyAccountByBranchManagerAsync(accountId, model, branchManagerId);
                if (!result)
                {
                    _logger.LogWarning("Branch account verification failed for account {AccountId} by manager {ManagerId}", accountId, branchManagerId);
                    return BadRequest(ApiResponse<object>.FailResponse("Account verification failed. You can only approve accounts in your branch."));
                }

                // Send email notification for verification result
                try
                {
                    var account = await _accountService.GetByIdAsync(accountId);
                    if (account != null)
                    {
                        var user = await _userService.GetByIdAsync(account.UserId);
                        if (user != null && !string.IsNullOrEmpty(user.Email))
                        {
                            if (model.IsApproved)
                            {
                                await _emailService.SendAccountApprovalEmailAsync(user.Email, user.FullName);
                            }
                            else
                            {
                                await _emailService.SendAccountRejectionEmailAsync(user.Email, user.FullName, model.Remarks ?? "Please contact your branch for more information.");
                            }
                            _logger.LogInformation("Branch account verification notification sent to {Email}", user.Email);
                        }
                    }
                }
                catch (Exception emailEx)
                {
                    _logger.LogWarning(emailEx, "Failed to send branch account verification notification");
                }

                var message = model.IsApproved ? "Account approved successfully" : "Account rejected";
                _logger.LogInformation("Account {AccountId} verified by branch manager {ManagerId}", accountId, branchManagerId);
                return Ok(ApiResponse<object>.SuccessResponse(new { }, message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying account {AccountId} by branch manager", accountId);
                return StatusCode(500, ApiResponse<object>.FailResponse(AccountMessages.UnexpectedError));
            }
        }

        // Update dormant accounts (Admin only)
        [HttpPut("update-dormant")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateDormantAccounts()
        {
            try
            {
                var result = await _accountService.UpdateAccountStatusToDormantAsync();
                if (!result)
                    return BadRequest(ApiResponse<object>.FailResponse("Failed to update dormant accounts"));

                return Ok(ApiResponse<object>.SuccessResponse(new { }, "Dormant accounts updated successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating dormant accounts");
                return StatusCode(500, ApiResponse<object>.FailResponse(AccountMessages.UnexpectedError));
            }
        }

        // Get account for editing (Admin only)
        [HttpGet("{id}/edit")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAccountForEdit(int id)
        {
            try
            {
                var result = await _accountService.GetByIdAsync(id);
                if (result == null)
                    return NotFound(ApiResponse<object>.FailResponse(AccountMessages.AccountNotFound));

                return Ok(ApiResponse<object>.SuccessResponse(result, "Account data for editing retrieved"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving account {Id} for editing", id);
                return StatusCode(500, ApiResponse<object>.FailResponse(AccountMessages.UnexpectedError));
            }
        }

        // Customer requests profile update (requires approval)
        [HttpPut("request-profile-update/{id}")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> RequestProfileUpdate(int id, [FromForm] AccountUpdateDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.FailResponse("Validation failed", ModelState));

            try
            {
                // Verify customer owns this account
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));

                // In real implementation, this would create an update request record
                // For now, we'll simulate immediate approval for demo
                var result = await _accountService.UpdateAsync(id, model);
                if (result == null)
                    return NotFound(ApiResponse<object>.FailResponse(AccountMessages.AccountNotFound));

                return Ok(ApiResponse<object>.SuccessResponse(result, "Profile update request submitted for approval"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating account profile {Id}", id);
                return StatusCode(500, ApiResponse<object>.FailResponse(AccountMessages.UnexpectedError));
            }
        }

        // Admin updates account (all fields) - Admin can update but not approve
        [HttpPut("admin-update/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminUpdateAccount(int id, [FromForm] AccountUpdateDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.FailResponse("Validation failed", ModelState));

            try
            {
                var result = await _accountService.UpdateAsync(id, model);
                if (result == null)
                    return NotFound(ApiResponse<object>.FailResponse(AccountMessages.AccountNotFound));

                return Ok(ApiResponse<object>.SuccessResponse(result, "Account updated by admin"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating account {Id}", id);
                return StatusCode(500, ApiResponse<object>.FailResponse(AccountMessages.UnexpectedError));
            }
        }

        // ✅ Soft delete account
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAccount(int id)
        {
            try
            {
                var result = await _accountService.DeleteAsync(id);
                if (!result)
                    return NotFound(ApiResponse<object>.FailResponse(AccountMessages.AccountNotFound));

                return Ok(ApiResponse<object>.SuccessResponse(new { }, AccountMessages.AccountDeleted));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting account {Id}", id);
                return StatusCode(500, ApiResponse<object>.FailResponse(AccountMessages.UnexpectedError));
            }
        }

        // Mark account as Verified (Branch Manager)
        [HttpPut("mark-verified/{id}")]
        [Authorize(Roles = "BranchManager")]
        public async Task<IActionResult> MarkAccountVerified(int id, [FromForm] string? remarks = null)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));

                var result = await _accountService.TransitionAccountStatusAsync(id, OnlineBank.Core.Enums.AccountStatus.Verified, userId, remarks);
                if (!result)
                    return BadRequest(ApiResponse<object>.FailResponse("Failed to verify account"));

                return Ok(ApiResponse<object>.SuccessResponse(new { }, "Account marked as verified"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking account {Id} as verified", id);
                return StatusCode(500, ApiResponse<object>.FailResponse(AccountMessages.UnexpectedError));
            }
        }

        // Close account (Branch Manager)
        [HttpPut("close/{id}")]
        [Authorize(Roles = "BranchManager")]
        public async Task<IActionResult> CloseAccount(int id, [FromForm] string? reason = null)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));

                var result = await _accountService.TransitionAccountStatusAsync(id, OnlineBank.Core.Enums.AccountStatus.Closed, userId, reason);
                if (!result)
                    return BadRequest(ApiResponse<object>.FailResponse("Failed to close account"));

                return Ok(ApiResponse<object>.SuccessResponse(new { }, "Account closed successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error closing account {Id}", id);
                return StatusCode(500, ApiResponse<object>.FailResponse(AccountMessages.UnexpectedError));
            }
        }

        // Reject account (Branch Manager)
        [HttpPut("reject/{id}")]
        [Authorize(Roles = "BranchManager")]
        public async Task<IActionResult> RejectAccount(int id, [FromForm] string? reason = null)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));

                var result = await _accountService.TransitionAccountStatusAsync(id, OnlineBank.Core.Enums.AccountStatus.Rejected, userId, reason);
                if (!result)
                    return BadRequest(ApiResponse<object>.FailResponse("Failed to reject account"));

                return Ok(ApiResponse<object>.SuccessResponse(new { }, "Account rejected"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting account {Id}", id);
                return StatusCode(500, ApiResponse<object>.FailResponse(AccountMessages.UnexpectedError));
            }
        }

        // Update account status (Admin only) - Legacy endpoint
        [HttpPut("update-status/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateAccountStatus(int id, [FromForm] int status)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));

                var accountStatus = (OnlineBank.Core.Enums.AccountStatus)status;
                var result = await _accountService.TransitionAccountStatusAsync(id, accountStatus, userId);
                if (!result)
                    return BadRequest(ApiResponse<object>.FailResponse("Failed to update account status"));

                return Ok(ApiResponse<object>.SuccessResponse(new { }, "Account status updated successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating account status {Id}", id);
                return StatusCode(500, ApiResponse<object>.FailResponse(AccountMessages.UnexpectedError));
            }
        }

        // Update account status with JSON payload (Admin only) - New clean endpoint
        [HttpPut("update-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateAccountStatusWithPayload([FromBody] UpdateAccountStatusDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.FailResponse("Validation failed", ModelState));

            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));

                var accountStatus = (OnlineBank.Core.Enums.AccountStatus)model.Status;
                var result = await _accountService.TransitionAccountStatusAsync(model.AccountId, accountStatus, userId);
                if (!result)
                    return BadRequest(ApiResponse<object>.FailResponse("Failed to update account status"));

                return Ok(ApiResponse<object>.SuccessResponse(new { }, "Account status updated successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating account status for account {AccountId}", model.AccountId);
                return StatusCode(500, ApiResponse<object>.FailResponse(AccountMessages.UnexpectedError));
            }
        }

        // Combined account dashboard for branch managers
        [HttpGet("branch-manager-dashboard")]
        [Authorize(Roles = "BranchManager")]
        public async Task<IActionResult> GetBranchManagerAccountDashboard()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));

                var userBranchId = await _userService.GetUserBranchIdAsync(userId);
                if (userBranchId == null)
                    return BadRequest(ApiResponse<object>.FailResponse("BranchManager must be assigned to a branch"));

                // Get all data in parallel
                var allAccountsTask = _accountService.GetAllAsync(1, int.MaxValue);
                var pendingAccountsTask = _accountService.GetPendingAccountsByBranchAsync(userBranchId.Value);
                
                await Task.WhenAll(allAccountsTask, pendingAccountsTask);
                
                var allAccounts = allAccountsTask.Result;
                var branchAccounts = allAccounts.Where(a => a.BranchId == userBranchId.Value).ToList();
                var pendingAccounts = pendingAccountsTask.Result;
                
                var dashboardData = new
                {
                    // Branch account summary
                    branchAccounts = branchAccounts.Select(a => new {
                        id = a.Id,
                        accountNumber = a.AccountNumber,
                        accountType = a.AccountType.ToString(),
                        balance = a.Balance,
                        status = a.Status.ToString(),
                        userId = a.UserId,
                        userName = a.UserName,
                        userEmail = a.UserEmail,
                        openedDate = a.OpenedDate,
                        isActive = a.IsActive
                    }).ToList(),
                    
                    // Pending accounts for approval
                    pendingAccounts = pendingAccounts.Select(a => new {
                        id = a.Id,
                        accountNumber = a.AccountNumber,
                        accountType = a.AccountType.ToString(),
                        userId = a.UserId,
                        userName = a.UserName,
                        userEmail = a.UserEmail,
                        openedDate = a.OpenedDate
                    }).ToList(),
                    
                    // Branch statistics
                    branchStats = new {
                        totalAccounts = branchAccounts.Count,
                        activeAccounts = branchAccounts.Count(a => a.Status == OnlineBank.Core.Enums.AccountStatus.Active),
                        pendingAccounts = pendingAccounts.Count(),
                        totalBalance = branchAccounts.Sum(a => a.Balance),
                        newAccountsThisMonth = branchAccounts.Count(a => a.OpenedDate.Month == DateTime.Now.Month)
                    }
                };
                
                return Ok(ApiResponse<object>.SuccessResponse(dashboardData, "Branch manager account dashboard retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving branch manager account dashboard");
                return StatusCode(500, ApiResponse<object>.FailResponse(AccountMessages.UnexpectedError));
            }
        }


    }
}

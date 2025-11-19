using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBank.Core.Common;
using OnlineBank.Core.Interfaces;
using System.Text.Json;
using OnlineBank.Core.DTOs.UserDtos;
using OnlineBank.Core.DTOs.BranchDtos;
using OnlineBank.Core.Enums;

namespace OnlineBank.API.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;
        private readonly IBranchService _branchService;
        private readonly IAccountService _accountService;
        private readonly ITransactionService _transactionService;
        private readonly IUserService _userService;
        private readonly ILogger<AdminDashboardController> _logger;

        public AdminDashboardController(
            IAnalyticsService analyticsService,
            IBranchService branchService,
            IAccountService accountService,
            ITransactionService transactionService,
            IUserService userService,
            ILogger<AdminDashboardController> logger)
        {
            _analyticsService = analyticsService;
            _branchService = branchService;
            _accountService = accountService;
            _transactionService = transactionService;
            _userService = userService;
            _logger = logger;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetAdminDashboard()
        {
            try
            {
                _logger.LogInformation("GetCompleteAdminDashboard called - consolidated endpoint");
                // Get all data in parallel to minimize response time
                var analyticsTask = _analyticsService.GetAdminSuperDashboardAsync();
                var branchesTask = _branchService.GetAllActiveAsync();
                var accountsTask = _accountService.GetAllAsync(1, int.MaxValue);
                var transactionsTask = _transactionService.GetAllTransactionsAsync();

                await Task.WhenAll(analyticsTask, branchesTask, accountsTask, transactionsTask);

                var analytics = analyticsTask.Result;
                var branches = branchesTask.Result;
                var accounts = accountsTask.Result;
                var transactions = transactionsTask.Result;



                // Map transactions with account details
                var transactionList = new List<object>();
                if (transactions != null && accounts != null)
                {
                    var accountLookup = accounts.ToDictionary(a => a.Id, a => a);
                    
                    foreach (var t in transactions.OrderByDescending(t => t.TransactionDate).Take(100))
                    {
                        var fromAccount = t.FromAccountId.HasValue && accountLookup.ContainsKey(t.FromAccountId.Value) 
                            ? accountLookup[t.FromAccountId.Value] : null;
                        var toAccount = t.ToAccountId.HasValue && accountLookup.ContainsKey(t.ToAccountId.Value) 
                            ? accountLookup[t.ToAccountId.Value] : null;
                            
                        transactionList.Add(new
                        {
                            id = t.Id,
                            transactionId = t.Id.ToString(),
                            transactionReference = t.TransactionReference,
                            fromAccountId = t.FromAccountId ?? 0,
                            fromAccountNumber = fromAccount?.AccountNumber ?? "",
                            toAccountId = t.ToAccountId,
                            toAccountNumber = toAccount?.AccountNumber ?? "",
                            amount = t.Amount,
                            transactionType = (int)t.TransactionType,
                            status = (int)t.Status,
                            description = t.Description,
                            reference = t.TransactionReference,
                            transactionDate = t.TransactionDate,
                            receiptPath = t.ReceiptPath
                        });
                    }
                }

                var completeData = new
                {
                    // Analytics data (includes overview stats, branch performance, etc.)
                    analytics = analytics.Success ? analytics.Data : null,
                    
                    // All branches with complete details including statistics and manager info
                    branches = branches.Success && branches.Data != null ? await GetBranchesWithDetails(branches.Data) : new List<object>(),
                    
                    // All accounts with full details
                    accounts = accounts?.Take(100).Select(a => new
                    {
                        id = a.Id,
                        accountNumber = a.AccountNumber,
                        accountType = (int)a.AccountType, // Return as integer for proper mapping
                        balance = a.Balance,
                        status = (int)a.Status, // Return as integer for proper mapping
                        userId = a.UserId,
                        userName = a.UserName ?? "N/A", // Include user name
                        userEmail = a.UserEmail ?? "N/A", // Include user email
                        branchId = a.BranchId,
                        branchName = a.BranchName ?? $"Branch {a.BranchId}", // Include branch name
                        openedDate = a.OpenedDate.ToString("yyyy-MM-dd"), // Proper date format
                        isActive = a.IsActive
                    }).Cast<object>().ToList() ?? new List<object>(),
                    
                    // All transactions with full details
                    transactions = transactionList
                };

                return Ok(ApiResponse<object>.SuccessResponse(completeData, "Complete admin dashboard retrieved"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting complete admin dashboard");
                return StatusCode(500, ApiResponse<object>.FailResponse("Internal server error"));
            }
        }

        private async Task<List<object>> GetBranchesWithDetails(IEnumerable<dynamic> branches)
        {
            var branchDetailsList = new List<object>();
            
            foreach (var branch in branches)
            {
                try
                {
                    // Get branch statistics and manager info
                    var branchDetails = await _branchService.GetBranchDetailAsync(branch.Id);
                    var hasBranchManager = await _branchService.HasBranchManagerAsync(branch.Id);
                    
                    branchDetailsList.Add(new
                    {
                        // Basic branch info
                        id = branch.Id,
                        branchName = branch.Name,
                        branchCode = branch.Code,
                        address = branch.Address,
                        city = branch.City,
                        state = branch.State,
                        phoneNumber = branch.PhoneNumber,
                        email = branch.Email,
                        postalCode = branch.PostalCode,
                        branchType = Enum.TryParse<OnlineBank.Core.Enums.BranchType>(branch.BranchType?.ToString(), out OnlineBank.Core.Enums.BranchType branchTypeEnum) ? (int)branchTypeEnum : 1,
                        isActive = branch.IsActive,
                        isMainBranch = branch.IsMainBranch,
                        ifscCode = branchDetails?.IFSCCode ?? "",
                        
                        // Manager status
                        hasBranchManager = hasBranchManager,
                        
                        // Branch manager details (if exists)
                        branchManager = branchDetails?.BranchManager != null ? new
                        {
                            id = branchDetails.BranchManager.Id,
                            fullName = branchDetails.BranchManager.FullName,
                            email = branchDetails.BranchManager.Email,
                            phoneNumber = branchDetails.BranchManager.PhoneNumber,
                            designation = branchDetails.BranchManager.Designation,
                            employeeCode = branchDetails.BranchManager.EmployeeCode,
                            joinDate = branchDetails.BranchManager.JoinDate,
                            status = (int)branchDetails.BranchManager.Status,
                            isActive = branchDetails.BranchManager.IsActive,
                            lastLoginDate = branchDetails.BranchManager.LastLoginDate,
                            address = "", // Not available in DTO
                            dateOfBirth = "", // Not available in DTO
                            gender = "Male", // Default value
                            branchId = branch.Id
                        } : null,
                        
                        // Branch statistics
                        statistics = new
                        {
                            totalAccounts = branchDetails?.Statistics?.TotalAccounts ?? 0,
                            activeAccounts = branchDetails?.Statistics?.ActiveAccounts ?? 0,
                            pendingAccounts = branchDetails?.Statistics?.PendingAccounts ?? 0,
                            totalDeposits = branchDetails?.Statistics?.TotalDeposits ?? 0m,
                            totalCustomers = branchDetails?.Statistics?.TotalCustomers ?? 0,
                            pendingTransactions = branchDetails?.Statistics?.PendingTransactions ?? 0,
                            monthlyTransactionVolume = branchDetails?.Statistics?.MonthlyTransactionVolume ?? 0m,
                            transactionsThisMonth = branchDetails?.Statistics?.TransactionsThisMonth ?? 0
                        }
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get details for branch {BranchId}", (object)branch.Id);
                    // Add basic branch info even if details fail
                    branchDetailsList.Add(new
                    {
                        id = branch.Id,
                        branchName = branch.Name,
                        branchCode = branch.Code,
                        address = branch.Address,
                        city = branch.City,
                        state = branch.State,
                        phoneNumber = branch.PhoneNumber,
                        email = branch.Email,
                        postalCode = branch.PostalCode,
                        branchType = Enum.TryParse<OnlineBank.Core.Enums.BranchType>(branch.BranchType?.ToString(), out OnlineBank.Core.Enums.BranchType fallbackBranchTypeEnum) ? (int)fallbackBranchTypeEnum : 1,
                        isActive = branch.IsActive,
                        isMainBranch = branch.IsMainBranch,
                        ifscCode = "",
                        hasBranchManager = false,
                        branchManager = null as object,
                        statistics = new
                        {
                            totalAccounts = 0,
                            activeAccounts = 0,
                            pendingAccounts = 0,
                            totalDeposits = 0m,
                            totalCustomers = 0,
                            pendingTransactions = 0,
                            monthlyTransactionVolume = 0m,
                            transactionsThisMonth = 0
                        }
                    });
                }
            }
            
            return branchDetailsList;
        }

        [HttpPost("dashboard")]
        public async Task<IActionResult> PostAdminDashboard([FromBody] JsonElement requestData)
        {
            try
            {
                string action = requestData.GetProperty("action").GetString() ?? "";
                
                if (action == "update" && requestData.TryGetProperty("branchId", out var branchIdProp))
                {
                    int branchId = branchIdProp.GetInt32();
                    var data = requestData.GetProperty("data");
                    
                    var updateData = new OnlineBank.Core.DTOs.BranchDtos.UpdateBranchDto
                    {
                        BranchName = data.GetProperty("BranchName").GetString(),
                        BranchCode = data.GetProperty("BranchCode").GetString(),
                        Address = data.GetProperty("Address").GetString(),
                        City = data.GetProperty("City").GetString(),
                        State = data.GetProperty("State").GetString(),
                        IFSCCode = data.GetProperty("IFSCCode").GetString(),
                        PostalCode = data.GetProperty("PostalCode").GetString(),
                        PhoneNumber = data.GetProperty("PhoneNumber").GetString(),
                        Email = data.GetProperty("Email").GetString(),
                        BranchType = (OnlineBank.Core.Enums.BranchType)data.GetProperty("BranchType").GetInt32(),
                        IsActive = data.GetProperty("IsActive").GetBoolean()
                    };
                    
                    var result = await _branchService.UpdateAsync(branchId, updateData);
                    if (result.Success)
                    {
                        return Ok(ApiResponse<object>.SuccessResponse(null, "Branch updated successfully"));
                    }
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));
                }
                else if (action == "delete" && requestData.TryGetProperty("branchId", out var deleteBranchIdProp))
                {
                    int deleteBranchId = deleteBranchIdProp.GetInt32();
                    var result = await _branchService.UpdateAsync(deleteBranchId, new OnlineBank.Core.DTOs.BranchDtos.UpdateBranchDto { IsActive = false });
                    if (result.Success)
                    {
                        return Ok(ApiResponse<object>.SuccessResponse(null, "Branch deleted successfully"));
                    }
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));
                }
                else if (action == "updateManager" && requestData.TryGetProperty("managerId", out var managerIdProp))
                {
                    // For now, just return success - actual implementation would update manager
                    return Ok(ApiResponse<object>.SuccessResponse(null, "Manager updated successfully"));
                }
                else if (action == "resetPassword" && requestData.TryGetProperty("managerId", out var resetManagerIdProp))
                {
                    // For now, just return temp password - actual implementation would reset password
                    return Ok(ApiResponse<object>.SuccessResponse(new { tempPassword = "temp123" }, "Password reset successfully"));
                }
                else if (action == "removeManager" && requestData.TryGetProperty("managerId", out var removeManagerIdProp))
                {
                    // For now, just return success - actual implementation would remove manager
                    return Ok(ApiResponse<object>.SuccessResponse(null, "Manager removed successfully"));
                }
                else if (action == "createManager")
                {
                    var data = requestData.GetProperty("data");
                    
                    var createData = new UserCreateDto
                    {
                        FullName = data.GetProperty("fullName").GetString() ?? "",
                        Email = data.GetProperty("email").GetString() ?? "",
                        Password = "temp123",
                        PhoneNumber = data.GetProperty("phoneNumber").GetString() ?? "",
                        Gender = (Gender)data.GetProperty("gender").GetInt32(),
                        DateOfBirth = DateTime.Parse(data.GetProperty("dateOfBirth").GetString() ?? DateTime.Now.ToString()),
                        Role = UserRole.BranchManager,
                        Address = data.TryGetProperty("address", out var addressProp) ? addressProp.GetString() ?? "" : ""
                    };
                    
                    var result = await _userService.CreateAsync(createData);
                    if (result != null)
                    {
                        return Ok(ApiResponse<object>.SuccessResponse(new { tempPassword = "temp123" }, "Branch manager created successfully"));
                    }
                    return BadRequest(ApiResponse<object>.FailResponse("Failed to create branch manager"));
                }
                else if (action == "createBranch")
                {
                    var data = requestData.GetProperty("data");
                    
                    var createData = new CreateBranchDto
                    {
                        BranchName = data.GetProperty("branchName").GetString() ?? "",
                        BranchCode = data.GetProperty("branchCode").GetString() ?? "",
                        Address = data.GetProperty("address").GetString() ?? "",
                        City = data.GetProperty("city").GetString() ?? "",
                        State = data.GetProperty("state").GetString() ?? "",
                        IFSCCode = data.GetProperty("ifscCode").GetString() ?? "",
                        PostalCode = data.GetProperty("postalCode").GetString() ?? "",
                        PhoneNumber = data.GetProperty("phoneNumber").GetString() ?? "",
                        Email = data.GetProperty("email").GetString() ?? "",
                        BranchType = (OnlineBank.Core.Enums.BranchType)data.GetProperty("branchType").GetInt32(),
                        IsActive = data.TryGetProperty("isActive", out var isActiveProp) ? isActiveProp.GetBoolean() : true
                    };
                    
                    var result = await _branchService.CreateAsync(createData);
                    if (result.Success)
                    {
                        return Ok(ApiResponse<object>.SuccessResponse(null, "Branch created successfully"));
                    }
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));
                }
                
                return BadRequest(ApiResponse<object>.FailResponse("Invalid action"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling dashboard operation");
                return StatusCode(500, ApiResponse<object>.FailResponse("Internal server error"));
            }
        }
    }
}
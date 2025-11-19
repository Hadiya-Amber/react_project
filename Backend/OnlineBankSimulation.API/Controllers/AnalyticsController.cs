using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBank.Core.Common;
using OnlineBank.Core.Interfaces;
using System.Security.Claims;

namespace OnlineBank.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(IAnalyticsService analyticsService, ILogger<AnalyticsController> logger)
        {
            _analyticsService = analyticsService;
            _logger = logger;
        }

        [HttpGet("overview-stats")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetOverviewStats()
        {
            try
            {
                var result = await _analyticsService.GetOverviewStatsAsync();
                if (!result.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));

                return Ok(ApiResponse<object>.SuccessResponse(result.Data, "Overview statistics retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving overview stats");
                return StatusCode(500, ApiResponse<object>.FailResponse("Failed to retrieve overview stats"));
            }
        }

        [HttpGet("branch-performance")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetBranchPerformance()
        {
            try
            {
                var result = await _analyticsService.GetBranchPerformanceAsync();
                if (!result.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));

                return Ok(ApiResponse<object>.SuccessResponse(result.Data, "Branch performance data retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving branch performance");
                return StatusCode(500, ApiResponse<object>.FailResponse("Failed to retrieve branch performance"));
            }
        }

        [HttpGet("recent-activities")]
        [Authorize(Roles = "Admin,BranchManager")]
        public async Task<IActionResult> GetRecentActivities([FromQuery] int count = 10)
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                int? branchId = null;

                if (userRole == "BranchManager")
                {
                    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (int.TryParse(userIdClaim, out int userId))
                    {
                        var branchResult = await _analyticsService.GetUserBranchIdAsync(userId);
                        if (branchResult.Success)
                            branchId = branchResult.Data;
                    }
                }

                var result = await _analyticsService.GetRecentActivitiesAsync(count, branchId);
                if (!result.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));

                return Ok(ApiResponse<object>.SuccessResponse(result.Data, "Recent activities retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent activities");
                return StatusCode(500, ApiResponse<object>.FailResponse("Failed to retrieve recent activities"));
            }
        }

        [HttpGet("branch-info")]
        [Authorize(Roles = "BranchManager")]
        public async Task<IActionResult> GetBranchInfo()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));

                var result = await _analyticsService.GetBranchInfoAsync(userId);
                if (!result.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));

                return Ok(ApiResponse<object>.SuccessResponse(result.Data, "Branch information retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving branch info");
                return StatusCode(500, ApiResponse<object>.FailResponse("Failed to retrieve branch info"));
            }
        }

        [HttpGet("monthly-stats")]
        [Authorize(Roles = "BranchManager")]
        public async Task<IActionResult> GetMonthlyStats()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));

                var result = await _analyticsService.GetMonthlyStatsAsync(userId);
                if (!result.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));

                return Ok(ApiResponse<object>.SuccessResponse(result.Data, "Monthly statistics retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving monthly stats");
                return StatusCode(500, ApiResponse<object>.FailResponse("Failed to retrieve monthly stats"));
            }
        }

        [HttpGet("transaction-trends")]
        [Authorize(Roles = "Admin,BranchManager")]
        public async Task<IActionResult> GetTransactionTrends([FromQuery] int days = 30)
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                int? branchId = null;

                if (userRole == "BranchManager")
                {
                    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (int.TryParse(userIdClaim, out int userId))
                    {
                        // Get branch ID for branch manager
                        var branchResult = await _analyticsService.GetUserBranchIdAsync(userId);
                        if (branchResult.Success)
                            branchId = branchResult.Data;
                    }
                }

                var result = await _analyticsService.GetTransactionTrendsAsync(days, branchId);
                if (!result.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));

                return Ok(ApiResponse<object>.SuccessResponse(result.Data, "Transaction trends retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transaction trends");
                return StatusCode(500, ApiResponse<object>.FailResponse("Failed to retrieve transaction trends"));
            }
        }

        [HttpGet("account-statistics")]
        [Authorize(Roles = "Admin,BranchManager")]
        public async Task<IActionResult> GetAccountStatistics()
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                int? branchId = null;

                if (userRole == "BranchManager")
                {
                    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (int.TryParse(userIdClaim, out int userId))
                    {
                        var branchResult = await _analyticsService.GetUserBranchIdAsync(userId);
                        if (branchResult.Success)
                            branchId = branchResult.Data;
                    }
                }

                var result = await _analyticsService.GetAccountStatisticsAsync(branchId);
                if (!result.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));

                return Ok(ApiResponse<object>.SuccessResponse(result.Data, "Account statistics retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving account statistics");
                return StatusCode(500, ApiResponse<object>.FailResponse("Failed to retrieve account statistics"));
            }
        }

        [HttpGet("personal-info")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetPersonalInfo()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));

                var result = await _analyticsService.GetPersonalInfoAsync(userId);
                if (!result.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));

                return Ok(ApiResponse<object>.SuccessResponse(result.Data, "Personal information retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving personal info");
                return StatusCode(500, ApiResponse<object>.FailResponse("Failed to retrieve personal info"));
            }
        }

        [HttpGet("account-summary")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetAccountSummary()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));

                var result = await _analyticsService.GetAccountSummaryAsync(userId);
                if (!result.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));

                return Ok(ApiResponse<object>.SuccessResponse(result.Data, "Account summary retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving account summary");
                return StatusCode(500, ApiResponse<object>.FailResponse("Failed to retrieve account summary"));
            }
        }

        [HttpGet("customer-transactions")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetCustomerTransactions([FromQuery] int count = 10)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));

                var result = await _analyticsService.GetCustomerTransactionsAsync(userId, count);
                if (!result.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));

                return Ok(ApiResponse<object>.SuccessResponse(result.Data, "Customer transactions retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving customer transactions");
                return StatusCode(500, ApiResponse<object>.FailResponse("Failed to retrieve customer transactions"));
            }
        }

        [HttpGet("customer-monthly-stats")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetCustomerMonthlyStats()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));

                var result = await _analyticsService.GetCustomerMonthlyStatsAsync(userId);
                if (!result.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));

                return Ok(ApiResponse<object>.SuccessResponse(result.Data, "Customer monthly statistics retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving customer monthly stats");
                return StatusCode(500, ApiResponse<object>.FailResponse("Failed to retrieve customer monthly stats"));
            }
        }

        [HttpGet("admin-dashboard")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminDashboard()
        {
            try
            {
                var result = await _analyticsService.GetAdminDashboardAsync();
                if (!result.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));

                return Ok(ApiResponse<object>.SuccessResponse(result.Data, "Admin dashboard data retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving admin dashboard");
                return StatusCode(500, ApiResponse<object>.FailResponse("Failed to retrieve admin dashboard"));
            }
        }

        [HttpGet("branch-manager-dashboard")]
        [Authorize(Roles = "BranchManager")]
        public async Task<IActionResult> GetBranchManagerDashboard()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));

                var result = await _analyticsService.GetBranchManagerDashboardAsync(userId);
                if (!result.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));

                return Ok(ApiResponse<object>.SuccessResponse(result.Data, "Branch manager dashboard data retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving branch manager dashboard");
                return StatusCode(500, ApiResponse<object>.FailResponse("Failed to retrieve branch manager dashboard"));
            }
        }

        [HttpGet("customer-dashboard")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetCustomerDashboard()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));

                var result = await _analyticsService.GetCustomerDashboardAsync(userId);
                if (!result.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));

                return Ok(ApiResponse<object>.SuccessResponse(result.Data, "Customer dashboard data retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving customer dashboard");
                return StatusCode(500, ApiResponse<object>.FailResponse("Failed to retrieve customer dashboard"));
            }
        }

        [HttpGet("admin-super-dashboard")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminSuperDashboard()
        {
            try
            {
                var result = await _analyticsService.GetAdminSuperDashboardAsync();
                if (!result.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));

                return Ok(ApiResponse<object>.SuccessResponse(result.Data, "Admin super dashboard data retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving admin super dashboard");
                return StatusCode(500, ApiResponse<object>.FailResponse("Failed to retrieve admin super dashboard"));
            }
        }

        [HttpGet("customer-complete-dashboard")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetCustomerCompleteDashboard()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(ApiResponse<object>.FailResponse("Invalid user token"));

                var result = await _analyticsService.GetCustomerCompleteDashboardAsync(userId);
                if (!result.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));

                return Ok(ApiResponse<object>.SuccessResponse(result.Data, "Complete customer dashboard data retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving complete customer dashboard");
                return StatusCode(500, ApiResponse<object>.FailResponse("Failed to retrieve complete customer dashboard"));
            }
        }


    }
}
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBank.Core.Enums;
using OnlineBank.Core.Interfaces;
using System.Security.Claims;

namespace OnlineBankSimulation.API.Controllers
{
    [ApiController]
    [Route("api/branch/analytics")]
    [Authorize(Roles = "BranchManager")]
    public class BranchAnalyticsController : ControllerBase
    {
        private readonly ITransactionService _transactionService;
        private readonly IAccountService _accountService;
        private readonly IUserService _userService;
        private readonly ILogger<BranchAnalyticsController> _logger;

        public BranchAnalyticsController(
            ITransactionService transactionService,
            IAccountService accountService,
            IUserService userService,
            ILogger<BranchAnalyticsController> logger)
        {
            _transactionService = transactionService;
            _accountService = accountService;
            _userService = userService;
            _logger = logger;
        }

        [HttpGet("branch-overview")]
        public async Task<IActionResult> GetBranchOverview()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(new { success = false, message = "Invalid user token" });

                var branchId = await _userService.GetUserBranchIdAsync(userId);
                if (!branchId.HasValue)
                    return BadRequest(new { success = false, message = "Branch manager not assigned to branch" });

                var branchAccounts = await _accountService.GetPendingAccountsByBranchAsync(branchId.Value);
                var allBranchAccounts = (await _accountService.GetAllAsync(1, 1000))
                    .Where(a => a.BranchId == branchId.Value);
                var allTransactions = await _transactionService.GetAllTransactionsAsync();

                var branchAccountIds = allBranchAccounts.Select(a => a.Id).ToList();
                var branchTransactions = allTransactions.Where(t =>
                    (t.FromAccountId.HasValue && branchAccountIds.Contains(t.FromAccountId.Value)) ||
                    (t.ToAccountId.HasValue && branchAccountIds.Contains(t.ToAccountId.Value))
                ).ToList();

                var today = DateTime.Today;
                var thisMonth = new DateTime(today.Year, today.Month, 1);

                var overview = new
                {
                    branchId = branchId.Value,
                    totalAccounts = allBranchAccounts.Count(),
                    activeAccounts = allBranchAccounts.Count(a => a.Status == AccountStatus.Active),
                    pendingAccounts = allBranchAccounts.Count(a => a.Status == AccountStatus.Pending),
                    totalBalance = allBranchAccounts.Sum(a => a.Balance),
                    todayTransactions = branchTransactions.Count(t => t.TransactionDate.Date == today),
                    monthlyTransactions = branchTransactions.Count(t => t.TransactionDate >= thisMonth),
                    pendingApprovals = branchTransactions.Count(t => t.Status == TransactionStatus.Pending)
                };

                return Ok(new { success = true, data = overview });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting branch overview");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpGet("daily-activity")]
        public async Task<IActionResult> GetDailyActivity([FromQuery] int days = 7)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(new { success = false, message = "Invalid user token" });

                var branchId = await _userService.GetUserBranchIdAsync(userId);
                if (!branchId.HasValue)
                    return BadRequest(new { success = false, message = "Branch manager not assigned to branch" });

                var allBranchAccounts = (await _accountService.GetAllAsync(1, 1000))
                    .Where(a => a.BranchId == branchId.Value);
                var allTransactions = await _transactionService.GetAllTransactionsAsync();
                var branchAccountIds = allBranchAccounts.Select(a => a.Id).ToList();

                var startDate = DateTime.Today.AddDays(-days);
                var dailyActivity = allTransactions
                    .Where(t => t.TransactionDate >= startDate &&
                        ((t.FromAccountId.HasValue && branchAccountIds.Contains(t.FromAccountId.Value)) ||
                         (t.ToAccountId.HasValue && branchAccountIds.Contains(t.ToAccountId.Value))))
                    .GroupBy(t => t.TransactionDate.Date)
                    .Select(g => new
                    {
                        date = g.Key.ToString("yyyy-MM-dd"),
                        transactions = g.Count(),
                        volume = g.Sum(t => t.Amount),
                        deposits = g.Count(t => t.TransactionType == TransactionType.Deposit),
                        withdrawals = g.Count(t => t.TransactionType == TransactionType.Withdrawal),
                        transfers = g.Count(t => t.TransactionType == TransactionType.Transfer)
                    })
                    .OrderBy(x => x.date)
                    .ToList();

                return Ok(new { success = true, data = dailyActivity });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily activity");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpGet("customer-summary")]
        public async Task<IActionResult> GetCustomerSummary()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(new { success = false, message = "Invalid user token" });

                var branchId = await _userService.GetUserBranchIdAsync(userId);
                if (!branchId.HasValue)
                    return BadRequest(new { success = false, message = "Branch manager not assigned to branch" });

                var branchAccounts = (await _accountService.GetAllAsync(1, 1000))
                    .Where(a => a.BranchId == branchId.Value);

                var customerSummary = branchAccounts
                    .GroupBy(a => a.UserId)
                    .Select(g => new
                    {
                        customerId = g.Key,
                        customerName = g.First().UserName,
                        accountCount = g.Count(),
                        totalBalance = g.Sum(a => a.Balance),
                        accountTypes = g.Select(a => a.AccountType.ToString()).Distinct().ToList(),
                        lastActivity = g.Max(a => a.OpenedDate)
                    })
                    .OrderByDescending(x => x.totalBalance)
                    .Take(20)
                    .ToList();

                return Ok(new { success = true, data = customerSummary });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customer summary");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }
    }
}
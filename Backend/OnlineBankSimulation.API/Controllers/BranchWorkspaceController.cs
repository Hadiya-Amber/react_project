using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBank.Core.Enums;
using OnlineBank.Core.Interfaces;
using OnlineBank.Core.DTOs.BranchDtos;
using System.Security.Claims;

namespace OnlineBankSimulation.API.Controllers
{
    [ApiController]
    [Route("api/branch")]
    [Authorize(Roles = "BranchManager")]
    public class BranchWorkspaceController : ControllerBase
    {
        private readonly ITransactionService _transactionService;
        private readonly IAccountService _accountService;
        private readonly IUserService _userService;
        private readonly IBranchService _branchService;
        private readonly ILogger<BranchWorkspaceController> _logger;

        public BranchWorkspaceController(
            ITransactionService transactionService,
            IAccountService accountService,
            IUserService userService,
            IBranchService branchService,
            ILogger<BranchWorkspaceController> logger)
        {
            _transactionService = transactionService;
            _accountService = accountService;
            _userService = userService;
            _branchService = branchService;
            _logger = logger;
        }

        [HttpGet("workspace")]
        public async Task<IActionResult> GetBranchManagerWorkspace()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized(new { success = false, message = "Invalid user token" });

                var branchId = await _userService.GetUserBranchIdAsync(userId);
                if (!branchId.HasValue)
                    return BadRequest(new { success = false, message = "Branch manager not assigned to branch" });

                // Get branch info
                var branchResult = await _branchService.GetByIdAsync(branchId.Value);
                if (!branchResult.Success || branchResult.Data == null)
                    return NotFound(new { success = false, message = "Branch not found" });
                
                var branch = branchResult.Data as BranchDetailDto;
                if (branch == null)
                    return NotFound(new { success = false, message = "Branch data not found" });

                // Get all branch accounts
                var allBranchAccounts = (await _accountService.GetAllAsync(1, 1000))
                    .Where(a => a.BranchId == branchId.Value).ToList();

                // Get all transactions for branch accounts
                var allTransactions = await _transactionService.GetAllTransactionsAsync();
                var branchAccountIds = allBranchAccounts.Select(a => a.Id).ToList();
                var branchTransactions = allTransactions.Where(t =>
                    (t.FromAccountId.HasValue && branchAccountIds.Contains(t.FromAccountId.Value)) ||
                    (t.ToAccountId.HasValue && branchAccountIds.Contains(t.ToAccountId.Value))
                ).ToList();

                var today = DateTime.Today;
                var thisMonth = new DateTime(today.Year, today.Month, 1);
                var last7Days = today.AddDays(-7);

                // Branch Info
                var branchInfo = new
                {
                    branchId = branch.Id,
                    branchName = branch.BranchName,
                    branchCode = branch.BranchCode,
                    branchType = branch.BranchType.ToString(),
                    address = $"{branch.Address}, {branch.City}, {branch.State} - {branch.PostalCode}"
                };

                // Branch Overview
                var branchOverview = new
                {
                    branchId = branchId.Value,
                    totalAccounts = allBranchAccounts.Count,
                    activeAccounts = allBranchAccounts.Count(a => a.Status == AccountStatus.Active),
                    pendingAccounts = allBranchAccounts.Count(a => a.Status == AccountStatus.Pending),
                    totalBalance = allBranchAccounts.Sum(a => a.Balance),
                    todayTransactions = branchTransactions.Count(t => t.TransactionDate.Date == today),
                    monthlyTransactions = branchTransactions.Count(t => t.TransactionDate >= thisMonth),
                    pendingApprovals = branchTransactions.Count(t => t.Status == TransactionStatus.Pending)
                };

                // Daily Activity (Last 7 days)
                var dailyActivity = branchTransactions
                    .Where(t => t.TransactionDate >= last7Days)
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

                // Customer Summary
                var customerSummary = allBranchAccounts
                    .GroupBy(a => a.UserId)
                    .Select(g => new
                    {
                        customerId = g.Key,
                        customerName = g.First().UserName,
                        accountCount = g.Count(),
                        totalBalance = g.Sum(a => a.Balance),
                        accountTypes = g.Select(a => a.AccountType.ToString()).Distinct().ToList(),
                        lastActivity = g.Max(a => a.OpenedDate).ToString("yyyy-MM-dd")
                    })
                    .OrderByDescending(x => x.totalBalance)
                    .Take(10)
                    .ToList();

                // Recent Transactions (Last 10)
                var recentTransactions = branchTransactions
                    .OrderByDescending(t => t.TransactionDate)
                    .Take(10)
                    .Select(t => new
                    {
                        transactionId = t.Id,
                        type = t.TransactionType.ToString(),
                        amount = t.Amount,
                        date = t.TransactionDate.ToString("yyyy-MM-dd HH:mm"),
                        description = t.Description,
                        status = t.Status.ToString(),
                        fromAccount = t.FromAccountId,
                        toAccount = t.ToAccountId
                    })
                    .ToList();

                // Pending Items
                var pendingAccounts = allBranchAccounts
                    .Where(a => a.Status == AccountStatus.Pending)
                    .Select(a => new
                    {
                        id = a.Id,
                        accountNumber = a.AccountNumber,
                        userId = a.UserId,
                        userName = a.UserName,
                        accountType = (int)a.AccountType,
                        balance = a.Balance,
                        branchId = a.BranchId,
                        branchName = a.BranchName,
                        status = (int)a.Status,
                        openedDate = a.OpenedDate.ToString("yyyy-MM-dd")
                    })
                    .ToList();

                var pendingTransactions = branchTransactions
                    .Where(t => t.Status == TransactionStatus.Pending)
                    .Select(t => new
                    {
                        id = t.Id,
                        transactionType = (int)t.TransactionType,
                        amount = t.Amount,
                        fromAccountId = t.FromAccountId,
                        toAccountId = t.ToAccountId,
                        description = t.Description,
                        transactionDate = t.TransactionDate.ToString("yyyy-MM-dd HH:mm"),
                        status = (int)t.Status
                    })
                    .ToList();

                var pendingItems = new
                {
                    accounts = pendingAccounts,
                    transactions = pendingTransactions
                };

                var workspaceData = new
                {
                    branchInfo,
                    branchOverview,
                    dailyActivity,
                    customerSummary,
                    recentTransactions,
                    pendingItems
                };

                return Ok(new { success = true, data = workspaceData });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting branch manager workspace data");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpGet("workspace/quick-stats")]
        public async Task<IActionResult> GetBranchQuickStats()
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
                var branchTransactions = allTransactions.Where(t =>
                    (t.FromAccountId.HasValue && branchAccountIds.Contains(t.FromAccountId.Value)) ||
                    (t.ToAccountId.HasValue && branchAccountIds.Contains(t.ToAccountId.Value))
                );

                var today = DateTime.Today;
                var thisMonth = new DateTime(today.Year, today.Month, 1);

                var quickStats = new
                {
                    totalAccounts = allBranchAccounts.Count(),
                    pendingApprovals = allBranchAccounts.Count(a => a.Status == AccountStatus.Pending) +
                                     branchTransactions.Count(t => t.Status == TransactionStatus.Pending),
                    todayTransactions = branchTransactions.Count(t => t.TransactionDate.Date == today),
                    monthlyVolume = branchTransactions
                        .Where(t => t.TransactionDate >= thisMonth)
                        .Sum(t => t.Amount)
                };

                return Ok(new { success = true, data = quickStats });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting branch quick stats");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }
    }
}
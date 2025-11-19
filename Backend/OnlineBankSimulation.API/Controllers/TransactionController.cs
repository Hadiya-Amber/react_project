using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBank.Core.DTOs.TransactionDtos;
using OnlineBank.Core.Interfaces;
using OnlineBank.Core.Services;
using OnlineBank.Core.Enums;
using System.Security.Claims;
using OnlineBank.Core.DTOs.UserDtos;

namespace OnlineBankSimulation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionService _transactionService;
        private readonly IAccountService _accountService;
        private readonly IUserService _userService;
        private readonly ILogger<TransactionController> _logger;

        public TransactionController(ITransactionService transactionService, IAccountService accountService, IUserService userService, ILogger<TransactionController> logger)
        {
            _transactionService = transactionService;
            _accountService = accountService;
            _userService = userService;
            _logger = logger;
        }

        //User-specific transaction views
        [HttpGet("user-history")]
        [HttpGet("/transaction/user-history")]
        public async Task<IActionResult> GetUserTransactionHistory([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null, [FromQuery] string? accountNumber = null)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { success = false, message = "Invalid user token" });
                }
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole == "BranchManager")
                {
                    // Get branch manager's branch ID
                    var branchId = await _userService.GetUserBranchIdAsync(userId);
                    if (branchId == null)
                    {
                        return BadRequest(new { success = false, message = "Branch manager not assigned to any branch" });
                    }
                    
                    // Get all accounts in this branch (we need to use GetAllAsync and filter by branch)
                    var allAccounts = await _accountService.GetAllAsync(1, int.MaxValue);
                    var branchAccounts = allAccounts.Where(a => a.BranchId == branchId.Value);
                    
                    // If account number is provided, filter to that specific account
                    if (!string.IsNullOrEmpty(accountNumber))
                    {
                        branchAccounts = branchAccounts.Where(a => a.AccountNumber.Contains(accountNumber, StringComparison.OrdinalIgnoreCase));
                    }
                    
                    var branchAccountIds = branchAccounts.Select(a => a.Id).ToList();
                    
                    // Get all transactions and filter by branch accounts
                    var allTransactions = await _transactionService.GetAllTransactionsAsync();
                    var branchTransactions = allTransactions.Where(t => 
                        (t.FromAccountId.HasValue && branchAccountIds.Contains(t.FromAccountId.Value)) ||
                        (t.ToAccountId.HasValue && branchAccountIds.Contains(t.ToAccountId.Value))
                    ).ToList();
                    
                    // Apply date filters
                    if (fromDate.HasValue)
                        branchTransactions = branchTransactions.Where(t => t.TransactionDate >= fromDate.Value).ToList();
                    if (toDate.HasValue)
                        branchTransactions = branchTransactions.Where(t => t.TransactionDate <= toDate.Value).ToList();
                    
                    var branchManagerHistory = new
                    {
                        transactions = branchTransactions.Select(t => new
                        {
                            id = t.Id,
                            transactionId = t.Id.ToString(),
                            transactionReference = t.TransactionReference,
                            fromAccountId = t.FromAccountId ?? 0,
                            fromAccountNumber = t.FromAccountId?.ToString() ?? "",
                            fromAccountHolderName = "Account Holder",
                            toAccountId = t.ToAccountId,
                            toAccountNumber = t.ToAccountId?.ToString() ?? "",
                            toAccountHolderName = "Recipient",
                            amount = t.Amount,
                            transactionType = (int)t.TransactionType,
                            status = (int)t.Status,
                            description = t.Description,
                            reference = t.TransactionReference,
                            transactionDate = t.TransactionDate,
                            direction = 0, // Default to credit
                            displayDescription = t.TransactionType.ToString(),
                            otherPartyName = "System Transaction",
                            otherPartyAccount = t.ToAccountId?.ToString() ?? "",
                            balanceAfterTransaction = 0
                        }).ToList(),
                        currentBalance = 0,
                        totalCredits = branchTransactions.Where(t => t.TransactionType == TransactionType.Deposit).Sum(t => t.Amount),
                        totalDebits = branchTransactions.Where(t => t.TransactionType == TransactionType.Withdrawal).Sum(t => t.Amount),
                        totalTransactions = branchTransactions.Count,
                        accountNumber = $"Branch {branchId} Accounts",
                        accountHolderName = "Branch Manager View"
                    };
                    
                    return Ok(new { success = true, data = branchManagerHistory, message = "Branch manager transaction history retrieved" });
                }

                // For customers, handle account number filtering
                if (!string.IsNullOrEmpty(accountNumber))
                {
                    // Get user accounts and filter by account number
                    var userAccounts = await _accountService.GetByUserIdAsync(userId);
                    var targetAccount = userAccounts.FirstOrDefault(a => a.AccountNumber == accountNumber);
                    
                    if (targetAccount == null)
                    {
                        return BadRequest(new { success = false, message = "Account not found or not accessible" });
                    }
                    
                    // Get all transactions and filter by specific account
                    var allTransactions = await _transactionService.GetAllTransactionsAsync();
                    var accountTransactions = allTransactions.Where(t =>
                        (t.FromAccountId == targetAccount.Id) || (t.ToAccountId == targetAccount.Id)
                    ).ToList();
                    
                    // Apply date filters
                    if (fromDate.HasValue)
                        accountTransactions = accountTransactions.Where(t => t.TransactionDate >= fromDate.Value).ToList();
                    if (toDate.HasValue)
                        accountTransactions = accountTransactions.Where(t => t.TransactionDate <= toDate.Value).ToList();
                    
                    // Calculate totals for this specific account
                    var creditTransactions = accountTransactions.Where(t => t.ToAccountId == targetAccount.Id);
                    var debitTransactions = accountTransactions.Where(t => t.FromAccountId == targetAccount.Id);
                    
                    // Get account numbers for proper display
                    var accountsForLookup = await _accountService.GetAllAsync(1, int.MaxValue);
                    var accountNumberLookup = accountsForLookup.ToDictionary(a => a.Id, a => a.AccountNumber);
                    
                    var accountHistory = new
                    {
                        transactions = accountTransactions.Select(t => new
                        {
                            id = t.Id,
                            transactionId = t.Id.ToString(),
                            transactionReference = t.TransactionReference,
                            fromAccountId = t.FromAccountId ?? 0,
                            fromAccountNumber = t.FromAccountId.HasValue && accountNumberLookup.ContainsKey(t.FromAccountId.Value) ? accountNumberLookup[t.FromAccountId.Value] : "",
                            fromAccountHolderName = "Account Holder",
                            toAccountId = t.ToAccountId,
                            toAccountNumber = t.ToAccountId.HasValue && accountNumberLookup.ContainsKey(t.ToAccountId.Value) ? accountNumberLookup[t.ToAccountId.Value] : "",
                            toAccountHolderName = "Recipient",
                            amount = t.Amount,
                            transactionType = (int)t.TransactionType,
                            status = (int)t.Status,
                            description = t.Description,
                            reference = t.TransactionReference,
                            transactionDate = t.TransactionDate,
                            direction = t.ToAccountId == targetAccount.Id ? 1 : 0, // 1 = Credit, 0 = Debit
                            displayDescription = t.TransactionType.ToString(),
                            otherPartyName = t.ToAccountId == targetAccount.Id ? "Money Received" : "Money Sent",
                            otherPartyAccount = t.ToAccountId == targetAccount.Id ? 
                                (t.FromAccountId.HasValue && accountNumberLookup.ContainsKey(t.FromAccountId.Value) ? accountNumberLookup[t.FromAccountId.Value] : "") : 
                                (t.ToAccountId.HasValue && accountNumberLookup.ContainsKey(t.ToAccountId.Value) ? accountNumberLookup[t.ToAccountId.Value] : ""),
                            balanceAfterTransaction = t.BalanceAfterTransaction
                        }).OrderByDescending(t => t.transactionDate).ToList(),
                        currentBalance = targetAccount.Balance,
                        totalCredits = creditTransactions.Sum(t => t.Amount),
                        totalDebits = debitTransactions.Sum(t => t.Amount),
                        totalTransactions = accountTransactions.Count,
                        accountNumber = targetAccount.AccountNumber,
                        accountHolderName = "Account Holder"
                    };
                    
                    return Ok(new { success = true, data = accountHistory, message = "Account-specific transaction history retrieved" });
                }
                
                // Default behavior for all accounts - get all user transactions
                var defaultUserAccounts = await _accountService.GetByUserIdAsync(userId);
                var defaultAllTransactions = await _transactionService.GetAllTransactionsAsync();
                var defaultAccountIds = defaultUserAccounts.Select(a => a.Id).ToList();
                
                var defaultUserTransactions = defaultAllTransactions.Where(t =>
                    (t.FromAccountId.HasValue && defaultAccountIds.Contains(t.FromAccountId.Value)) ||
                    (t.ToAccountId.HasValue && defaultAccountIds.Contains(t.ToAccountId.Value))
                ).ToList();
                
                // Apply date filters
                if (fromDate.HasValue)
                    defaultUserTransactions = defaultUserTransactions.Where(t => t.TransactionDate >= fromDate.Value).ToList();
                if (toDate.HasValue)
                    defaultUserTransactions = defaultUserTransactions.Where(t => t.TransactionDate <= toDate.Value).ToList();
                
                // Get account numbers for proper display
                var defaultAllAccounts = await _accountService.GetAllAsync(1, int.MaxValue);
                var defaultAccountLookup = defaultAllAccounts.ToDictionary(a => a.Id, a => a.AccountNumber);
                
                var result = new
                {
                    transactions = defaultUserTransactions.Select(t => new
                    {
                        id = t.Id,
                        transactionId = t.Id.ToString(),
                        transactionReference = t.TransactionReference,
                        fromAccountId = t.FromAccountId ?? 0,
                        fromAccountNumber = t.FromAccountId.HasValue && defaultAccountLookup.ContainsKey(t.FromAccountId.Value) ? defaultAccountLookup[t.FromAccountId.Value] : "",
                        fromAccountHolderName = "Account Holder",
                        toAccountId = t.ToAccountId,
                        toAccountNumber = t.ToAccountId.HasValue && defaultAccountLookup.ContainsKey(t.ToAccountId.Value) ? defaultAccountLookup[t.ToAccountId.Value] : "",
                        toAccountHolderName = "Recipient",
                        amount = t.Amount,
                        transactionType = (int)t.TransactionType,
                        status = (int)t.Status,
                        description = t.Description,
                        reference = t.TransactionReference,
                        transactionDate = t.TransactionDate,
                        direction = defaultAccountIds.Contains(t.ToAccountId ?? 0) ? 1 : 0,
                        displayDescription = t.TransactionType.ToString(),
                        otherPartyName = defaultAccountIds.Contains(t.ToAccountId ?? 0) ? "Money Received" : "Money Sent",
                        otherPartyAccount = defaultAccountIds.Contains(t.ToAccountId ?? 0) ? 
                            (t.FromAccountId.HasValue && defaultAccountLookup.ContainsKey(t.FromAccountId.Value) ? defaultAccountLookup[t.FromAccountId.Value] : "") : 
                            (t.ToAccountId.HasValue && defaultAccountLookup.ContainsKey(t.ToAccountId.Value) ? defaultAccountLookup[t.ToAccountId.Value] : ""),
                        balanceAfterTransaction = t.BalanceAfterTransaction
                    }).OrderByDescending(t => t.transactionDate).ToList(),
                    currentBalance = defaultUserAccounts.FirstOrDefault()?.Balance ?? 0,
                    totalCredits = defaultUserTransactions.Where(t => defaultAccountIds.Contains(t.ToAccountId ?? 0)).Sum(t => t.Amount),
                    totalDebits = defaultUserTransactions.Where(t => defaultAccountIds.Contains(t.FromAccountId ?? 0)).Sum(t => t.Amount),
                    totalTransactions = defaultUserTransactions.Count,
                    accountNumber = "All Accounts",
                    accountHolderName = "Account Holder"
                };
                
                return Ok(new { success = true, data = result, message = "Transaction history retrieved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user transaction history");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpGet("dashboard-summary")]
        public async Task<IActionResult> GetDashboardTransactionSummary()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { success = false, message = "Invalid user token" });
                }

                // Get user's primary account balance
                var userAccounts = await _accountService.GetByUserIdAsync(userId);
                var primaryAccount = userAccounts.FirstOrDefault();
                var currentBalance = primaryAccount?.Balance ?? 0;
                
                // Get recent transactions
                var result = await _transactionService.GetAccountStatementAsync(userId, DateTime.Now.AddDays(-7), DateTime.Now);
                
                var summary = new {
                    recentTransactions = result.Data?.Take(5).ToList() ?? new List<TransactionReadDto>(),
                    currentBalance = currentBalance,
                    availableBalance = currentBalance
                };
                
                return Ok(new { success = true, data = summary, message = "Dashboard summary retrieved" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard transaction summary");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        // Keep all existing endpoints for backward compatibility
        [HttpPost("deposit")]
        public async Task<IActionResult> ProcessDeposit([FromForm] DepositDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int.TryParse(userIdClaim, out int userId);

                var result = await _transactionService.ProcessDepositAsync(dto, userId);
                
                if (result.Success)
                {
                    return Ok(new { success = true, message = result.Message });
                }
                
                return BadRequest(new { success = false, message = result.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing deposit");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpPost("withdraw")]
        public async Task<IActionResult> ProcessWithdrawal([FromForm] WithdrawalDto dto)
        {
            try
            {
                var result = await _transactionService.ProcessWithdrawalAsync(dto);
                
                if (result.Success)
                {
                    return Ok(new { success = true, message = result.Message });
                }
                
                return BadRequest(new { success = false, message = result.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing withdrawal");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpPost("transfer")]
        public async Task<IActionResult> ProcessTransfer([FromForm] TransferDto dto)
        {
            try
            {
                var result = await _transactionService.ProcessTransferAsync(dto);
                
                if (result.Success)
                {
                    return Ok(new { success = true, message = result.Message });
                }
                
                return BadRequest(new { success = false, message = result.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing transfer");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpGet("pending-approval")]
        [Authorize(Roles = "Admin,BranchManager")]
        public async Task<IActionResult> GetPendingTransactions()
        {
            try
            {
                var result = await _transactionService.GetPendingTransactionsAsync();
                
                if (result.Success)
                {
                    return Ok(new { success = true, data = result.Data, message = result.Message });
                }
                
                return BadRequest(new { success = false, message = result.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending transactions");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpGet("pending-approval/branch/{branchId}")]
        [Authorize(Roles = "Admin,BranchManager")]
        public async Task<IActionResult> GetPendingTransactionsByBranch(int branchId)
        {
            try
            {
                var result = await _transactionService.GetPendingTransactionsByBranchAsync(branchId);
                
                if (result.Success)
                {
                    return Ok(new { success = true, data = result.Data, message = result.Message });
                }
                
                return BadRequest(new { success = false, message = result.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending transactions by branch");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpPut("approve/{id}")]
        [Authorize(Roles = "Admin,BranchManager")]
        public async Task<IActionResult> ApproveTransaction(int id, [FromBody] TransactionApprovalDto dto)
        {
            try
            {
                _logger.LogInformation("Approving transaction {Id} with data: IsApproved={IsApproved}, Remarks={Remarks}", id, dto?.IsApproved, dto?.Remarks);
                
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.SelectMany(x => x.Value.Errors).Select(x => x.ErrorMessage);
                    _logger.LogWarning("Model validation failed: {Errors}", string.Join(", ", errors));
                    return BadRequest(new { success = false, message = string.Join(", ", errors) });
                }
                
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var result = await _transactionService.ApproveTransactionAsync(id, userIdClaim ?? "0", dto.IsApproved, dto.Remarks);
                
                if (result.Success)
                {
                    return Ok(new { success = true, message = result.Message });
                }
                
                return BadRequest(new { success = false, message = result.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving transaction {Id}", id);
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpGet("statement")]
        public async Task<IActionResult> GetAccountStatement([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { success = false, message = "Invalid user token" });
                }

                // Get user accounts
                var userAccounts = await _accountService.GetByUserIdAsync(userId);
                if (!userAccounts.Any())
                {
                    return Ok(new { success = true, data = new List<object>(), message = "No accounts found" });
                }

                // Get all transactions
                var allTransactions = await _transactionService.GetAllTransactionsAsync();
                var accountIds = userAccounts.Select(a => a.Id).ToList();
                
                // Filter transactions for user's accounts
                var userTransactions = allTransactions.Where(t =>
                    (t.FromAccountId.HasValue && accountIds.Contains(t.FromAccountId.Value)) ||
                    (t.ToAccountId.HasValue && accountIds.Contains(t.ToAccountId.Value))
                ).ToList();

                // Apply date filters
                if (fromDate.HasValue)
                    userTransactions = userTransactions.Where(t => t.TransactionDate >= fromDate.Value).ToList();
                
                if (toDate.HasValue)
                    userTransactions = userTransactions.Where(t => t.TransactionDate <= toDate.Value).ToList();

                // Calculate running balance for each transaction
                var primaryAccount = userAccounts.First();
                var currentBalance = primaryAccount.Balance;
                var orderedTransactions = userTransactions.OrderBy(t => t.TransactionDate).ToList();
                
                var transactions = new List<object>();
                var runningBalance = currentBalance;
                
                // Calculate balance working backwards from current balance
                for (int i = orderedTransactions.Count - 1; i >= 0; i--)
                {
                    var t = orderedTransactions[i];
                    var isCredit = t.ToAccountId.HasValue && accountIds.Contains(t.ToAccountId.Value);
                    var isDebit = t.FromAccountId.HasValue && accountIds.Contains(t.FromAccountId.Value);
                    
                    // For the most recent transaction, use current balance
                    if (i == orderedTransactions.Count - 1)
                    {
                        // Current balance is after this transaction
                    }
                    else
                    {
                        // Calculate what balance was before this transaction
                        var nextTransaction = orderedTransactions[i + 1];
                        var nextIsCredit = nextTransaction.ToAccountId.HasValue && accountIds.Contains(nextTransaction.ToAccountId.Value);
                        var nextIsDebit = nextTransaction.FromAccountId.HasValue && accountIds.Contains(nextTransaction.FromAccountId.Value);
                        
                        if (nextIsCredit && !nextIsDebit)
                        {
                            runningBalance -= nextTransaction.Amount; // Subtract the credit to get previous balance
                        }
                        else if (nextIsDebit && !nextIsCredit)
                        {
                            runningBalance += nextTransaction.Amount; // Add back the debit to get previous balance
                        }
                    }
                    
                    transactions.Insert(0, new
                    {
                        id = t.Id,
                        transactionId = t.Id.ToString(),
                        reference = t.TransactionReference,
                        amount = t.Amount,
                        transactionType = t.TransactionType.ToString(),
                        status = t.Status.ToString(),
                        description = t.Description,
                        transactionDate = t.TransactionDate,
                        fromAccountId = t.FromAccountId,
                        toAccountId = t.ToAccountId,
                        balanceAfterTransaction = (t.Status == TransactionStatus.Completed ? t.BalanceAfterTransaction : runningBalance)
                    });
                }
                
                transactions = transactions.OrderByDescending(t => ((dynamic)t).transactionDate).ToList();

                return Ok(new { success = true, data = transactions, message = "Transactions retrieved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting account statement: {Error}", ex.Message);
                return StatusCode(500, new { success = false, message = $"Internal server error: {ex.Message}" });
            }
        }

        // Legacy receipt endpoint
        [HttpGet("receipt/{transactionId}")]
        public async Task<IActionResult> DownloadReceipt(int transactionId)
        {
            return await GenerateReceiptInternal(transactionId);
        }

        // New clean receipt endpoint with JSON payload
        [HttpPost("receipt")]
        public async Task<IActionResult> DownloadReceiptWithPayload([FromBody] ReceiptRequestDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid request" });

            return await GenerateReceiptInternal(model.TransactionId);
        }

        private async Task<IActionResult> GenerateReceiptInternal(int transactionId)
        {
            try
            {
                // Always generate new receipt with updated design
                var result = await _transactionService.GenerateReceiptAsync(transactionId);
                
                if (result.Success && result.Data != null)
                {
                    // Save to wwwroot/receipts
                    var receiptsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "receipts");
                    Directory.CreateDirectory(receiptsDir);
                    
                    var fileName = $"receipt_{transactionId}_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
                    var filePath = Path.Combine(receiptsDir, fileName);
                    var relativePath = $"/receipts/{fileName}";
                    
                    await System.IO.File.WriteAllBytesAsync(filePath, result.Data);
                    
                    // Update transaction with receipt path
                    await _transactionService.UpdateReceiptPathAsync(transactionId, relativePath);
                    
                    return File(result.Data, "application/pdf", $"receipt_{transactionId}.pdf");
                }
                
                return BadRequest(new { success = false, message = result.Message ?? "Receipt generation failed" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating receipt");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpGet("pdf-statement")]
        public async Task<IActionResult> DownloadPdfStatement([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { success = false, message = "Invalid user token" });
                }

                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                
                if (userRole == "Admin")
                {
                    _logger.LogInformation("PDF Statement Request - FromDate: {FromDate}, ToDate: {ToDate}", fromDate, toDate);
                    
                    // For admin, get ALL transactions across ALL accounts
                    var allTransactions = await _transactionService.GetAllTransactionsAsync();
                    _logger.LogInformation("Total transactions from DB: {Count}", allTransactions.Count());
                    
                    // Log first few transaction dates for debugging
                    foreach (var t in allTransactions.Take(3))
                    {
                        _logger.LogInformation("Sample transaction date: {Date}", t.TransactionDate);
                    }
                    
                    // Apply date filters
                    var filteredTransactions = allTransactions.AsEnumerable();
                    if (fromDate.HasValue)
                    {
                        filteredTransactions = filteredTransactions.Where(t => t.TransactionDate >= fromDate.Value);
                        _logger.LogInformation("After fromDate filter ({FromDate}): {Count}", fromDate.Value, filteredTransactions.Count());
                    }
                    
                    if (toDate.HasValue)
                    {
                        var endOfDay = toDate.Value.Date.AddDays(1).AddTicks(-1);
                        filteredTransactions = filteredTransactions.Where(t => t.TransactionDate <= endOfDay);
                        _logger.LogInformation("After toDate filter ({ToDate} to {EndOfDay}): {Count}", toDate.Value, endOfDay, filteredTransactions.Count());
                    }
                    
                    var finalTransactions = filteredTransactions.ToList();
                    _logger.LogInformation("Final filtered transactions: {Count}", finalTransactions.Count);

                    var pdfGenerator = HttpContext.RequestServices.GetRequiredService<OnlineBank.Core.Interfaces.IPdfGenerator>();
                    var pdfBytes = await pdfGenerator.GenerateTransactionStatementAsync(finalTransactions, "All Accounts", 0, fromDate, toDate);
                    
                    if (pdfBytes.Length == 0)
                    {
                        return BadRequest(new { success = false, message = "Failed to generate PDF statement" });
                    }
                    
                    return File(pdfBytes, "application/pdf", $"admin_statement_{DateTime.Now:yyyyMMdd}.pdf");
                }
                else
                {
                    // For regular users, get user-specific transactions
                    var userAccounts = await _accountService.GetByUserIdAsync(userId);
                    if (!userAccounts.Any())
                    {
                        return BadRequest(new { success = false, message = "No accounts found" });
                    }

                    var primaryAccount = userAccounts.First();
                    var allTransactions = await _transactionService.GetAllTransactionsAsync();
                    var accountIds = userAccounts.Select(a => a.Id).ToList();
                    
                    var userTransactions = allTransactions.Where(t =>
                        (t.FromAccountId.HasValue && accountIds.Contains(t.FromAccountId.Value)) ||
                        (t.ToAccountId.HasValue && accountIds.Contains(t.ToAccountId.Value))
                    ).ToList();

                    if (fromDate.HasValue)
                        userTransactions = userTransactions.Where(t => t.TransactionDate >= fromDate.Value).ToList();
                    
                    if (toDate.HasValue)
                    {
                        var endOfDay = toDate.Value.Date.AddDays(1).AddTicks(-1);
                        userTransactions = userTransactions.Where(t => t.TransactionDate <= endOfDay).ToList();
                    }

                    var pdfGenerator = HttpContext.RequestServices.GetRequiredService<OnlineBank.Core.Interfaces.IPdfGenerator>();
                    var pdfBytes = await pdfGenerator.GenerateTransactionStatementAsync(userTransactions, primaryAccount.AccountNumber, primaryAccount.Id, fromDate, toDate);
                    
                    if (pdfBytes.Length == 0)
                    {
                        return BadRequest(new { success = false, message = "Failed to generate PDF statement" });
                    }
                    
                    return File(pdfBytes, "application/pdf", $"statement_{DateTime.Now:yyyyMMdd}.pdf");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating PDF statement");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        // Bill payment functionality removed - DTO not available

        // Loan payment functionality removed - not implemented

        // Investment deposit functionality removed - not implemented

        [HttpPost("filter")]
        public async Task<IActionResult> GetFilteredTransactions([FromForm] TransactionFilterDto filter)
        {
            try
            {
                var result = await _transactionService.GetFilteredTransactionsAsync(filter);
                
                if (result.Success)
                {
                    return Ok(new { success = true, data = result.Data, message = result.Message });
                }
                
                return BadRequest(new { success = false, message = result.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting filtered transactions");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin,BranchManager")]
        public async Task<IActionResult> GetAllTransactions()
        {
            try
            {
                var transactions = await _transactionService.GetAllTransactionsAsync();
                var mapped = transactions.Select(t => new TransactionReadDto
                {
                    Id = t.Id,
                    TransactionId = t.Id.ToString(),
                    Reference = t.TransactionReference,
                    FromAccountId = t.FromAccountId ?? 0,
                    FromAccountNumber = "", // Would need to fetch from account
                    ToAccountId = t.ToAccountId,
                    ToAccountNumber = "", // Would need to fetch from account
                    Amount = t.Amount,
                    TransactionType = t.TransactionType,
                    Status = t.Status,
                    Description = t.Description,
                    TransactionDate = t.TransactionDate
                });
                
                return Ok(new { success = true, data = mapped, message = "Transactions retrieved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all transactions");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpPut("approve-branch-manager/{id}")]
        [Authorize(Roles = "BranchManager")]
        public async Task<IActionResult> ApproveTransactionByBranchManager(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int managerId))
                {
                    return Unauthorized(new { success = false, message = "Invalid manager token" });
                }

                var result = await _transactionService.ApproveTransactionByManagerAsync(id, managerId);
                
                if (result.Success)
                {
                    return Ok(new { success = true, message = result.Message });
                }
                
                return BadRequest(new { success = false, message = result.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving transaction by branch manager");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpPut("reverse/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ReverseTransaction(int id, [FromForm] string reason)
        {
            try
            {
                var result = await _transactionService.ReverseTransactionAsync(id, reason);
                
                if (result.Success)
                {
                    return Ok(new { success = true, message = result.Message });
                }
                
                return BadRequest(new { success = false, message = result.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reversing transaction");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpPost("fix-failed-transactions")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> FixFailedTransactions()
        {
            try
            {
                var result = await _transactionService.FixFailedSmallTransactionsAsync();
                
                if (result.Success)
                {
                    return Ok(new { success = true, data = new { fixedCount = result.FixedCount }, message = result.Message });
                }
                
                return BadRequest(new { success = false, message = result.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fixing failed transactions");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpGet("customer-complete-dashboard")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetCustomerCompleteTransactionDashboard()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { success = false, message = "Invalid user token" });
                }

                // Get user accounts
                var userAccounts = await _accountService.GetByUserIdAsync(userId);
                if (!userAccounts.Any())
                {
                    return Ok(new { success = true, data = new { 
                        recentTransactions = new List<object>(),
                        currentBalance = 0,
                        availableBalance = 0,
                        transactionHistory = new List<object>(),
                        accountSummary = new List<object>()
                    }, message = "No accounts found" });
                }

                var primaryAccount = userAccounts.First();
                var accountIds = userAccounts.Select(a => a.Id).ToList();
                
                // Get all transactions for user
                var allTransactions = await _transactionService.GetAllTransactionsAsync();
                var userTransactions = allTransactions.Where(t =>
                    (t.FromAccountId.HasValue && accountIds.Contains(t.FromAccountId.Value)) ||
                    (t.ToAccountId.HasValue && accountIds.Contains(t.ToAccountId.Value))
                ).OrderByDescending(t => t.TransactionDate).ToList();

                var completeData = new {
                    // Recent transactions (last 5)
                    recentTransactions = userTransactions.Take(5).Select(t => new {
                        id = t.Id,
                        transactionId = t.Id.ToString(),
                        amount = t.Amount,
                        transactionType = t.TransactionType.ToString(),
                        status = t.Status.ToString(),
                        description = t.Description,
                        transactionDate = t.TransactionDate
                    }).ToList(),
                    
                    // Account balances
                    currentBalance = primaryAccount.Balance,
                    availableBalance = primaryAccount.Balance,
                    
                    // Full transaction history (last 30 days)
                    transactionHistory = userTransactions.Where(t => t.TransactionDate >= DateTime.Now.AddDays(-30))
                        .Select(t => new {
                            id = t.Id,
                            transactionId = t.Id.ToString(),
                            amount = t.Amount,
                            transactionType = t.TransactionType.ToString(),
                            status = t.Status.ToString(),
                            description = t.Description,
                            transactionDate = t.TransactionDate,
                            fromAccountId = t.FromAccountId,
                            toAccountId = t.ToAccountId
                        }).ToList(),
                    
                    // Account summary
                    accountSummary = userAccounts.Select(a => new {
                        id = a.Id,
                        accountNumber = a.AccountNumber,
                        accountType = a.AccountType.ToString(),
                        balance = a.Balance,
                        status = a.Status.ToString()
                    }).ToList()
                };
                
                return Ok(new { success = true, data = completeData, message = "Complete transaction dashboard retrieved" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting complete customer transaction dashboard");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpGet("admin-super-dashboard")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminSuperDashboard()
        {
            try
            {
                // Get ALL data in one call to minimize API requests
                var analyticsResult = await HttpContext.RequestServices.GetRequiredService<OnlineBank.Core.Interfaces.IAnalyticsService>().GetAdminSuperDashboardAsync();
                
                if (analyticsResult.Success)
                {
                    return Ok(new { success = true, data = analyticsResult.Data, message = "Admin super dashboard retrieved" });
                }
                
                return BadRequest(new { success = false, message = analyticsResult.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting admin super dashboard");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpGet("admin-complete-dashboard")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminCompleteTransactionDashboard()
        {
            try
            {
                // Get all data in parallel
                var allTransactionsTask = _transactionService.GetAllTransactionsAsync();
                var pendingTransactionsTask = _transactionService.GetPendingTransactionsAsync();
                var allAccountsTask = _accountService.GetAllAsync(1, int.MaxValue);
                
                await Task.WhenAll(allTransactionsTask, pendingTransactionsTask, allAccountsTask);
                
                var allTransactions = allTransactionsTask.Result;
                var pendingTransactions = pendingTransactionsTask.Result;
                var allAccounts = allAccountsTask.Result;
                
                var completeData = new {
                    // Recent transactions (last 10)
                    recentTransactions = allTransactions.OrderByDescending(t => t.TransactionDate)
                        .Take(10)
                        .Select(t => new {
                            id = t.Id,
                            transactionId = t.Id.ToString(),
                            amount = t.Amount,
                            transactionType = t.TransactionType.ToString(),
                            status = t.Status.ToString(),
                            description = t.Description,
                            transactionDate = t.TransactionDate
                        }).ToList(),
                    
                    // Pending transactions
                    pendingTransactions = pendingTransactions.Success && pendingTransactions.Data != null ? pendingTransactions.Data.Cast<object>().ToList() : new List<object>(),
                    
                    // Transaction statistics
                    transactionStats = new {
                        totalTransactions = allTransactions.Count(),
                        pendingCount = pendingTransactions.Success && pendingTransactions.Data != null ? ((IEnumerable<object>)pendingTransactions.Data).Count() : 0,
                        completedToday = allTransactions.Count(t => t.TransactionDate.Date == DateTime.Today && t.Status == TransactionStatus.Completed),
                        totalVolume = allTransactions.Where(t => t.Status == TransactionStatus.Completed).Sum(t => t.Amount)
                    },
                    
                    // Account statistics
                    accountStats = new {
                        totalAccounts = allAccounts.Count(),
                        activeAccounts = allAccounts.Count(a => a.Status == OnlineBank.Core.Enums.AccountStatus.Active),
                        totalBalance = allAccounts.Sum(a => a.Balance)
                    }
                };
                
                return Ok(new { success = true, data = completeData, message = "Complete admin transaction dashboard retrieved" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting complete admin transaction dashboard");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }
    }
}
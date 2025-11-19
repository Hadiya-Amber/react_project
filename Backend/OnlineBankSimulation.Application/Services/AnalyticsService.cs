using Microsoft.EntityFrameworkCore;
using OnlineBank.Core.Common;
using OnlineBank.Core.DTOs.AnalyticsDtos;
using OnlineBank.Core.Enums;
using OnlineBank.Core.Interfaces;
using OnlineBank.Core.Repositories;
using OnlineBank.Core.Repository;
using OnlineBank.Core.Models;

namespace OnlineBankSimulation.Application.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly IUserRepository _userRepository;
        private readonly IBranchRepository _branchRepository;
        private readonly IAccountRepository _accountRepository;
        private readonly ITransactionRepository _transactionRepository;

        public AnalyticsService(
            IUserRepository userRepository,
            IBranchRepository branchRepository,
            IAccountRepository accountRepository,
            ITransactionRepository transactionRepository)
        {
            _userRepository = userRepository;
            _branchRepository = branchRepository;
            _accountRepository = accountRepository;
            _transactionRepository = transactionRepository;
        }

        public async Task<ServiceResult<object>> GetOverviewStatsAsync()
        {
            try
            {
                var branches = await _branchRepository.GetAllAsync();
                var customers = await _userRepository.GetAllUsersAsync();
                var accounts = await _accountRepository.GetAllAccountsAsync();
                var transactions = await _transactionRepository.GetAllTransactionsAsync();

                var currentMonth = DateTime.UtcNow.Month;
                var currentYear = DateTime.UtcNow.Year;

                var branchList = branches.ToList();
                var customerList = customers.ToList();
                var accountList = accounts.ToList();
                var transactionList = transactions.ToList();

                var overviewStats = new
                {
                    TotalBranches = branchList.Count(),
                    TotalCustomers = customerList.Count(),
                    TotalAccounts = accountList.Count(),
                    PendingAccounts = accountList.Count(a => a.Status == AccountStatus.Pending),
                    TotalDeposits = accountList.Sum(a => a.Balance),
                    TotalTransactions = transactionList.Count(),
                    PendingTransactions = transactionList.Count(t => t.Status == TransactionStatus.Pending),
                    MonthlyTransactionVolume = transactionList
                        .Where(t => t.TransactionDate.Month == currentMonth && t.TransactionDate.Year == currentYear)
                        .Sum(t => t.Amount)
                };

                return ServiceResult<object>.SuccessResult(overviewStats, "Overview statistics retrieved successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<object>.FailureResult($"Failed to retrieve overview statistics: {ex.Message}");
            }
        }

        public async Task<ServiceResult<object>> GetBranchPerformanceAsync()
        {
            try
            {
                var branches = await _branchRepository.GetAllAsync();
                var accounts = await _accountRepository.GetAllAccountsAsync();
                var transactions = await _transactionRepository.GetAllTransactionsAsync();

                var currentMonth = DateTime.UtcNow.Month;
                var currentYear = DateTime.UtcNow.Year;

                var branchList = branches.ToList();
                var accountList = accounts.ToList();
                var transactionList = transactions.ToList();

                var branchPerformance = branchList.Select(b => {
                    var branchAccounts = accountList.Where(a => a.BranchId == b.Id).ToList();
                    var branchAccountIds = branchAccounts.Select(a => a.Id).ToHashSet();
                    var branchTransactions = transactionList.Where(t => 
                        (t.FromAccountId.HasValue && branchAccountIds.Contains(t.FromAccountId.Value)) ||
                        (t.ToAccountId.HasValue && branchAccountIds.Contains(t.ToAccountId.Value))
                    ).ToList();
                    
                    var monthlyTransactions = branchTransactions.Where(t => 
                        t.TransactionDate.Month == currentMonth && t.TransactionDate.Year == currentYear
                    ).ToList();
                    
                    return new
                    {
                        BranchId = b.Id,
                        BranchName = b.BranchName ?? "",
                        BranchCode = b.BranchCode ?? "",
                        TotalAccounts = branchAccounts.Count,
                        ActiveAccounts = branchAccounts.Count(a => a.Status == AccountStatus.Active),
                        TotalDeposits = branchAccounts.Sum(a => a.Balance),
                        TransactionsThisMonth = monthlyTransactions.Count,
                        TransactionVolumeThisMonth = monthlyTransactions.Sum(t => t.Amount)
                    };
                }).ToList();

                return ServiceResult<object>.SuccessResult(branchPerformance, "Branch performance data retrieved successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<object>.FailureResult($"Failed to retrieve branch performance: {ex.Message}");
            }
        }

        public async Task<ServiceResult<object>> GetRecentActivitiesAsync(int count, int? branchId = null)
        {
            try
            {
                var transactions = await _transactionRepository.GetAllTransactionsAsync();
                var accounts = await _accountRepository.GetAllAccountsAsync();
                var users = await _userRepository.GetAllUsersAsync();
                var branches = await _branchRepository.GetAllAsync();

                var transactionList = transactions.ToList();
                var accountList = accounts.ToList();
                var userList = users.ToList();
                var branchList = branches.ToList();

                var filteredTransactions = transactionList.AsEnumerable();
                
                if (branchId.HasValue)
                {
                    var branchAccountIds = accountList.Where(a => a.BranchId == branchId.Value).Select(a => a.Id).ToHashSet();
                    filteredTransactions = filteredTransactions.Where(t => 
                        (t.FromAccountId.HasValue && branchAccountIds.Contains(t.FromAccountId.Value)) ||
                        (t.ToAccountId.HasValue && branchAccountIds.Contains(t.ToAccountId.Value)));
                }

                var recentActivities = filteredTransactions
                    .OrderByDescending(t => t.TransactionDate)
                    .Take(count)
                    .Select(t => {
                        var fromAccount = t.FromAccountId.HasValue ? accountList.FirstOrDefault(a => a.Id == t.FromAccountId.Value) : null;
                        var toAccount = t.ToAccountId.HasValue ? accountList.FirstOrDefault(a => a.Id == t.ToAccountId.Value) : null;
                        var fromUser = fromAccount != null ? userList.FirstOrDefault(u => u.Id == fromAccount.UserId) : null;
                        var toUser = toAccount != null ? userList.FirstOrDefault(u => u.Id == toAccount.UserId) : null;
                        var fromBranch = fromAccount != null ? branchList.FirstOrDefault(b => b.Id == fromAccount.BranchId) : null;
                        var toBranch = toAccount != null ? branchList.FirstOrDefault(b => b.Id == toAccount.BranchId) : null;
                        
                        // For admin view, show the primary user involved in the transaction
                        string primaryUser;
                        string primaryBranch;
                        
                        switch (t.TransactionType)
                        {
                            case TransactionType.Deposit:
                                // For deposits, show the receiver (to account)
                                primaryUser = toUser?.FullName ?? "Unknown User";
                                primaryBranch = toBranch?.BranchName ?? "Unknown Branch";
                                break;
                            case TransactionType.Withdrawal:
                                // For withdrawals, show the sender (from account)
                                primaryUser = fromUser?.FullName ?? "Unknown User";
                                primaryBranch = fromBranch?.BranchName ?? "Unknown Branch";
                                break;
                            case TransactionType.Transfer:
                                // For transfers, show the sender (from account)
                                primaryUser = fromUser?.FullName ?? "Unknown User";
                                primaryBranch = fromBranch?.BranchName ?? "Unknown Branch";
                                break;
                            default:
                                primaryUser = fromUser?.FullName ?? toUser?.FullName ?? "Unknown User";
                                primaryBranch = fromBranch?.BranchName ?? toBranch?.BranchName ?? "Unknown Branch";
                                break;
                        }
                        
                        return new
                        {
                            ActivityType = t.TransactionType.ToString(),
                            Description = t.Description ?? $"{t.TransactionType} of ₹{t.Amount:N2}",
                            Timestamp = t.TransactionDate,
                            UserName = primaryUser,
                            BranchName = primaryBranch,
                            Amount = t.Amount,
                            TransactionType = t.TransactionType.ToString(),
                            FromAccountNumber = fromAccount?.AccountNumber ?? "",
                            ToAccountNumber = toAccount?.AccountNumber ?? "",
                            Status = t.Status.ToString()
                        };
                    })
                    .ToList();

                return ServiceResult<object>.SuccessResult(recentActivities, "Recent activities retrieved successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<object>.FailureResult($"Failed to retrieve recent activities: {ex.Message}");
            }
        }

        public async Task<ServiceResult<object>> GetBranchInfoAsync(int userId)
        {
            try
            {
                var user = await _userRepository.GetUserByIdAsync(userId);
                if (user == null || user.BranchId == null)
                    return ServiceResult<object>.FailureResult("Branch manager not found or not assigned to a branch");

                var branchId = user.BranchId.Value;
                var branch = await _branchRepository.GetByIdAsync(branchId);
                var accounts = await _accountRepository.GetAccountsByBranchIdAsync(branchId);
                var transactions = await _transactionRepository.GetAllTransactionsAsync();

                var branchInfo = new
                {
                    BranchName = branch?.BranchName,
                    BranchCode = branch?.BranchCode,
                    TotalAccounts = accounts.Count(),
                    ActiveAccounts = accounts.Count(a => a.Status == AccountStatus.Active),
                    PendingAccounts = accounts.Count(a => a.Status == AccountStatus.Pending),
                    TotalDeposits = accounts.Sum(a => a.Balance),
                    PendingTransactions = transactions.Count(t => t.Status == TransactionStatus.Pending)
                };

                return ServiceResult<object>.SuccessResult(branchInfo, "Branch information retrieved successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<object>.FailureResult($"Failed to retrieve branch information: {ex.Message}");
            }
        }

        public async Task<ServiceResult<object>> GetMonthlyStatsAsync(int userId)
        {
            try
            {
                var user = await _userRepository.GetUserByIdAsync(userId);
                if (user == null || user.BranchId == null)
                    return ServiceResult<object>.FailureResult("Branch manager not found or not assigned to a branch");

                var branchId = user.BranchId.Value;
                var accounts = await _accountRepository.GetAccountsByBranchIdAsync(branchId);
                var transactions = await _transactionRepository.GetAllTransactionsAsync();

                var currentMonth = DateTime.UtcNow.Month;
                var currentYear = DateTime.UtcNow.Year;

                var monthlyStats = new
                {
                    TransactionsThisMonth = transactions.Count(t => 
                        t.TransactionDate.Month == currentMonth && t.TransactionDate.Year == currentYear),
                    VolumeThisMonth = transactions
                        .Where(t => t.TransactionDate.Month == currentMonth && t.TransactionDate.Year == currentYear)
                        .Sum(t => t.Amount),
                    NewAccountsThisMonth = accounts.Count(a => 
                        a.CreatedAt.Month == currentMonth && a.CreatedAt.Year == currentYear)
                };

                return ServiceResult<object>.SuccessResult(monthlyStats, "Monthly statistics retrieved successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<object>.FailureResult($"Failed to retrieve monthly statistics: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<TransactionTrendDto>>> GetTransactionTrendsAsync(int days, int? branchId = null)
        {
            try
            {
                var startDate = DateTime.UtcNow.AddDays(-days);
                var transactions = await _transactionRepository.GetAllTransactionsAsync();
                var accounts = branchId.HasValue 
                    ? await _accountRepository.GetAccountsByBranchIdAsync(branchId.Value)
                    : await _accountRepository.GetAllAccountsAsync();

                var filteredTransactions = transactions.Where(t => t.TransactionDate >= startDate);

                if (branchId.HasValue)
                {
                    var branchAccountIds = accounts.Select(a => a.Id).ToList();
                    filteredTransactions = filteredTransactions.Where(t => 
                        (t.FromAccountId.HasValue && branchAccountIds.Contains(t.FromAccountId.Value)) ||
                        (t.ToAccountId.HasValue && branchAccountIds.Contains(t.ToAccountId.Value)));
                }

                var trends = filteredTransactions
                    .GroupBy(t => t.TransactionDate.Date)
                    .Select(g => new TransactionTrendDto
                    {
                        Date = g.Key,
                        TransactionCount = g.Count(),
                        TransactionVolume = g.Sum(t => t.Amount),
                        DepositCount = g.Count(t => t.TransactionType == TransactionType.Deposit),
                        WithdrawalCount = g.Count(t => t.TransactionType == TransactionType.Withdrawal),
                        TransferCount = g.Count(t => t.TransactionType == TransactionType.Transfer)
                    })
                    .OrderBy(t => t.Date)
                    .ToList();

                return ServiceResult<List<TransactionTrendDto>>.SuccessResult(trends, "Transaction trends retrieved successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<List<TransactionTrendDto>>.FailureResult($"Failed to retrieve transaction trends: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<AccountTypeDistributionDto>>> GetAccountStatisticsAsync(int? branchId = null)
        {
            try
            {
                var accounts = branchId.HasValue 
                    ? await _accountRepository.GetAccountsByBranchIdAsync(branchId.Value)
                    : await _accountRepository.GetAllAccountsAsync();

                var totalAccounts = accounts.Count();
                var distribution = accounts
                    .GroupBy(a => a.Type)
                    .Select(g => new AccountTypeDistributionDto
                    {
                        AccountType = g.Key.ToString(),
                        Count = g.Count(),
                        Percentage = totalAccounts > 0 ? (decimal)g.Count() / totalAccounts * 100 : 0,
                        TotalBalance = g.Sum(a => a.Balance)
                    })
                    .ToList();

                return ServiceResult<List<AccountTypeDistributionDto>>.SuccessResult(distribution, "Account statistics retrieved successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<List<AccountTypeDistributionDto>>.FailureResult($"Failed to retrieve account statistics: {ex.Message}");
            }
        }

        public async Task<ServiceResult<int>> GetUserBranchIdAsync(int userId)
        {
            try
            {
                var user = await _userRepository.GetUserByIdAsync(userId);
                if (user?.BranchId == null)
                    return ServiceResult<int>.FailureResult("User not found or not assigned to a branch");

                return ServiceResult<int>.SuccessResult(user.BranchId.Value, "User branch ID retrieved successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<int>.FailureResult($"Failed to retrieve user branch ID: {ex.Message}");
            }
        }

        public async Task<ServiceResult<object>> GetPersonalInfoAsync(int userId)
        {
            try
            {
                var user = await _userRepository.GetUserByIdAsync(userId);
                if (user == null)
                    return ServiceResult<object>.FailureResult("User not found");

                var accounts = await _accountRepository.GetAccountsByUserIdAsync(userId);

                var personalInfo = new
                {
                    FullName = user.FullName,
                    Email = user.Email,
                    TotalAccounts = accounts.Count(),
                    TotalBalance = accounts.Sum(a => a.Balance)
                };

                return ServiceResult<object>.SuccessResult(personalInfo, "Personal information retrieved successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<object>.FailureResult($"Failed to retrieve personal information: {ex.Message}");
            }
        }

        public async Task<ServiceResult<object>> GetAccountSummaryAsync(int userId)
        {
            try
            {
                var accounts = await _accountRepository.GetAccountsByUserIdAsync(userId);

                var accountSummary = accounts.Select(a => new
                {
                    AccountId = a.Id,
                    AccountNumber = a.AccountNumber,
                    AccountType = a.Type.ToString(),
                    Balance = a.Balance,
                    Status = a.Status.ToString()
                }).ToList();

                return ServiceResult<object>.SuccessResult(accountSummary, "Account summary retrieved successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<object>.FailureResult($"Failed to retrieve account summary: {ex.Message}");
            }
        }

        public async Task<ServiceResult<object>> GetCustomerTransactionsAsync(int userId, int count)
        {
            try
            {
                var accounts = await _accountRepository.GetAccountsByUserIdAsync(userId);
                var transactions = await _transactionRepository.GetAllTransactionsAsync();

                var userTransactions = transactions.Where(t => 
                    accounts.Any(a => a.Id == t.FromAccountId || a.Id == t.ToAccountId)
                ).ToList();

                var recentTransactions = userTransactions
                    .OrderByDescending(t => t.TransactionDate)
                    .Take(count)
                    .Select(t => {
                        var userAccountIds = accounts.Select(a => a.Id).ToList();
                        bool isSender = t.FromAccountId.HasValue && userAccountIds.Contains(t.FromAccountId.Value);
                        bool isReceiver = t.ToAccountId.HasValue && userAccountIds.Contains(t.ToAccountId.Value);
                        
                        string displayType;
                        switch (t.TransactionType)
                        {
                            case TransactionType.Deposit:
                                displayType = "Cash Deposit";
                                break;
                            case TransactionType.Withdrawal:
                                displayType = "Cash Withdrawal";
                                break;
                            case TransactionType.Transfer:
                                if (isSender && isReceiver)
                                    displayType = "Internal Transfer";
                                else if (isSender)
                                    displayType = "Money Transfer";
                                else
                                    displayType = "Money Received";
                                break;
                            default:
                                displayType = t.TransactionType.ToString();
                                break;
                        }
                        
                        // Calculate the correct amount and direction for this user
                        decimal displayAmount = t.Amount;
                        int direction = 1; // 1 = Credit (incoming), 0 = Debit (outgoing)
                        
                        switch (t.TransactionType)
                        {
                            case TransactionType.Deposit:
                                direction = 1;
                                break;
                            case TransactionType.Withdrawal:
                                direction = 0;
                                break;
                            case TransactionType.Transfer:
                                if (isSender && !isReceiver)
                                {
                                    direction = 0; // Sending money
                                }
                                else if (isReceiver && !isSender)
                                {
                                    direction = 1; // Receiving money
                                }
                                else if (isSender && isReceiver)
                                {
                                    direction = 1; // Internal transfer
                                }
                                break;
                        }
                        
                        return new
                        {
                            TransactionId = t.Id,
                            Type = displayType,
                            Amount = displayAmount,
                            Date = t.TransactionDate,
                            Description = t.Description,
                            Status = t.Status.ToString(),
                            Direction = direction,
                            FromAccountId = t.FromAccountId,
                            ToAccountId = t.ToAccountId,
                            TransactionType = (int)t.TransactionType
                        };
                    }).ToList();

                return ServiceResult<object>.SuccessResult(recentTransactions, "Customer transactions retrieved successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<object>.FailureResult($"Failed to retrieve customer transactions: {ex.Message}");
            }
        }

        public async Task<ServiceResult<object>> GetCustomerMonthlyStatsAsync(int userId)
        {
            try
            {
                var accounts = await _accountRepository.GetAccountsByUserIdAsync(userId);
                var transactions = await _transactionRepository.GetAllTransactionsAsync();

                var userTransactions = transactions.Where(t => 
                    accounts.Any(a => a.Id == t.FromAccountId || a.Id == t.ToAccountId)
                ).ToList();

                var currentMonth = DateTime.UtcNow.Month;
                var currentYear = DateTime.UtcNow.Year;

                var monthlyStats = new
                {
                    TransactionsThisMonth = userTransactions.Count(t => 
                        t.TransactionDate.Month == currentMonth && t.TransactionDate.Year == currentYear),
                    SpentThisMonth = userTransactions
                        .Where(t => {
                            if (t.TransactionDate.Month != currentMonth || t.TransactionDate.Year != currentYear)
                                return false;
                                
                            var userAccountIds = accounts.Select(a => a.Id).ToList();
                            bool isSender = t.FromAccountId.HasValue && userAccountIds.Contains(t.FromAccountId.Value);
                            bool isReceiver = t.ToAccountId.HasValue && userAccountIds.Contains(t.ToAccountId.Value);
                            
                            return (t.TransactionType == TransactionType.Withdrawal && isSender) ||
                                   (t.TransactionType == TransactionType.Transfer && isSender && !isReceiver);
                        })
                        .Sum(t => t.Amount),
                    ReceivedThisMonth = userTransactions
                        .Where(t => {
                            if (t.TransactionDate.Month != currentMonth || t.TransactionDate.Year != currentYear)
                                return false;
                                
                            var userAccountIds = accounts.Select(a => a.Id).ToList();
                            bool isSender = t.FromAccountId.HasValue && userAccountIds.Contains(t.FromAccountId.Value);
                            bool isReceiver = t.ToAccountId.HasValue && userAccountIds.Contains(t.ToAccountId.Value);
                            
                            return (t.TransactionType == TransactionType.Deposit && isReceiver && !isSender) ||
                                   (t.TransactionType == TransactionType.Transfer && isReceiver && !isSender);
                        })
                        .Sum(t => t.Amount)
                };

                return ServiceResult<object>.SuccessResult(monthlyStats, "Customer monthly statistics retrieved successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<object>.FailureResult($"Failed to retrieve customer monthly statistics: {ex.Message}");
            }
        }

        // Combined dashboard methods for efficient loading
        public async Task<ServiceResult<object>> GetAdminDashboardAsync()
        {
            try
            {
                // Execute operations sequentially to avoid DbContext threading issues
                var overviewStatsResult = await GetOverviewStatsAsync();
                var branchPerformanceResult = await GetBranchPerformanceAsync();
                var transactionTrendsResult = await GetTransactionTrendsAsync(30, null);
                var accountStatisticsResult = await GetAccountStatisticsAsync(null);
                var recentActivitiesResult = await GetRecentActivitiesAsync(10, null);

                var dashboard = new
                {
                    overviewStats = overviewStatsResult.Success ? overviewStatsResult.Data : null,
                    branchPerformance = branchPerformanceResult.Success ? branchPerformanceResult.Data : null,
                    transactionTrends = transactionTrendsResult.Success ? transactionTrendsResult.Data : null,
                    accountTypeDistribution = accountStatisticsResult.Success ? accountStatisticsResult.Data : null,
                    recentActivities = recentActivitiesResult.Success ? recentActivitiesResult.Data : null
                };

                return ServiceResult<object>.SuccessResult(dashboard, "Admin dashboard data retrieved successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<object>.FailureResult($"Failed to retrieve admin dashboard: {ex.Message}");
            }
        }

        public async Task<ServiceResult<object>> GetBranchManagerDashboardAsync(int userId)
        {
            try
            {
                // Execute operations sequentially to avoid DbContext threading issues
                var branchInfoResult = await GetBranchInfoAsync(userId);
                var monthlyStatsResult = await GetMonthlyStatsAsync(userId);

                var dashboard = new
                {
                    branchInfo = branchInfoResult.Success ? branchInfoResult.Data : null,
                    monthlyStats = monthlyStatsResult.Success ? monthlyStatsResult.Data : null
                };

                return ServiceResult<object>.SuccessResult(dashboard, "Branch manager dashboard data retrieved successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<object>.FailureResult($"Failed to retrieve branch manager dashboard: {ex.Message}");
            }
        }

        public async Task<ServiceResult<object>> GetCustomerDashboardAsync(int userId)
        {
            try
            {
                // Execute operations sequentially to avoid DbContext threading issues
                var personalInfoResult = await GetPersonalInfoAsync(userId);
                var accountSummaryResult = await GetAccountSummaryAsync(userId);
                var transactionsResult = await GetCustomerTransactionsAsync(userId, 10);
                var monthlyStatsResult = await GetCustomerMonthlyStatsAsync(userId);

                var dashboard = new
                {
                    personalInfo = personalInfoResult.Success ? personalInfoResult.Data : null,
                    accountSummary = accountSummaryResult.Success ? accountSummaryResult.Data : null,
                    recentTransactions = transactionsResult.Success ? transactionsResult.Data : null,
                    monthlyStats = monthlyStatsResult.Success ? monthlyStatsResult.Data : null
                };

                return ServiceResult<object>.SuccessResult(dashboard, "Customer dashboard data retrieved successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<object>.FailureResult($"Failed to retrieve customer dashboard: {ex.Message}");
            }
        }

        public async Task<ServiceResult<object>> GetCustomerCompleteDashboardAsync(int userId)
        {
            try
            {
                // Get ALL data in one go to avoid multiple API calls
                var user = await _userRepository.GetUserByIdAsync(userId);
                var accounts = await _accountRepository.GetAccountsByUserIdAsync(userId);
                var transactions = await _transactionRepository.GetAllTransactionsAsync();

                if (user == null)
                    return ServiceResult<object>.FailureResult("User not found");

                // Filter user transactions - get all transactions involving user's accounts
                var userAccountIds = accounts.Select(a => a.Id).ToList();
                var userTransactions = transactions.Where(t => 
                    (t.FromAccountId.HasValue && userAccountIds.Contains(t.FromAccountId.Value)) ||
                    (t.ToAccountId.HasValue && userAccountIds.Contains(t.ToAccountId.Value))
                ).OrderByDescending(t => t.TransactionDate).ToList();

                var currentMonth = DateTime.UtcNow.Month;
                var currentYear = DateTime.UtcNow.Year;

                // Calculate age for minor account check
                int? userAge = null;
                bool hasMinorAccounts = accounts.Any(a => a.Type == AccountType.Minor);
                bool isMinorAccountBlocked = false;
                
                if (user.DateOfBirth != default(DateTime))
                {
                    var birthDate = user.DateOfBirth;
                    var today = DateTime.UtcNow;
                    var age = today.Year - birthDate.Year;
                    var monthDiff = today.Month - birthDate.Month;
                    if (monthDiff < 0 || (monthDiff == 0 && today.Day < birthDate.Day))
                        age--;
                    userAge = age;
                    
                    var hasNonMinorAccounts = accounts.Any(a => a.Type != AccountType.Minor);
                    isMinorAccountBlocked = age >= 18 && hasMinorAccounts && hasNonMinorAccounts;
                }

                var dashboard = new
                {
                    // Personal Info
                    personalInfo = new
                    {
                        FullName = user.FullName,
                        Email = user.Email,
                        TotalAccounts = accounts.Count(),
                        TotalBalance = accounts.Where(a => a.Status == AccountStatus.Active).Sum(a => a.Balance)
                    },
                    
                    // Account Summary
                    accountSummary = accounts.Select(a => new
                    {
                        AccountId = a.Id,
                        AccountNumber = a.AccountNumber,
                        AccountType = a.Type.ToString(),
                        Balance = a.Balance,
                        Status = a.Status.ToString()
                    }).ToList(),
                    
                    // Recent Transactions
                    recentTransactions = userTransactions
                        .Take(10)
                        .Select(t => {
                            bool isSender = t.FromAccountId.HasValue && userAccountIds.Contains(t.FromAccountId.Value);
                            bool isReceiver = t.ToAccountId.HasValue && userAccountIds.Contains(t.ToAccountId.Value);
                            
                            string displayType;
                            switch (t.TransactionType)
                            {
                                case TransactionType.Deposit:
                                    displayType = "Cash Deposit";
                                    break;
                                case TransactionType.Withdrawal:
                                    displayType = "Cash Withdrawal";
                                    break;
                                case TransactionType.Transfer:
                                    if (isSender && isReceiver)
                                        displayType = "Internal Transfer";
                                    else if (isSender)
                                        displayType = "Money Transfer";
                                    else
                                        displayType = "Money Received";
                                    break;
                                default:
                                    displayType = t.TransactionType.ToString();
                                    break;
                            }
                            
                            // Calculate the correct amount and direction for this user
                            decimal displayAmount = t.Amount;
                            int direction = 1; // 1 = Credit (incoming), 0 = Debit (outgoing)
                            
                            switch (t.TransactionType)
                            {
                                case TransactionType.Deposit:
                                    // For deposits, always positive for receiver
                                    direction = 1;
                                    break;
                                case TransactionType.Withdrawal:
                                    // For withdrawals, always negative for sender
                                    direction = 0;
                                    break;
                                case TransactionType.Transfer:
                                    if (isSender && !isReceiver)
                                    {
                                        // User is sending money - debit
                                        direction = 0;
                                    }
                                    else if (isReceiver && !isSender)
                                    {
                                        // User is receiving money - credit
                                        direction = 1;
                                    }
                                    else if (isSender && isReceiver)
                                    {
                                        // Internal transfer - neutral
                                        direction = 1;
                                    }
                                    break;
                            }
                            
                            return new
                            {
                                TransactionId = t.Id,
                                Type = displayType,
                                Amount = displayAmount,
                                Date = t.TransactionDate,
                                Description = t.Description ?? $"{displayType} of ₹{displayAmount:N2}",
                                Status = t.Status.ToString(),
                                Direction = direction,
                                FromAccountId = t.FromAccountId,
                                ToAccountId = t.ToAccountId,
                                FromAccountNumber = "", // Will be populated by frontend
                                ToAccountNumber = "", // Will be populated by frontend
                                TransactionType = (int)t.TransactionType
                            };
                        }).ToList(),
                    
                    // Monthly Stats
                    monthlyStats = new
                    {
                        TransactionsThisMonth = userTransactions.Count(t => 
                            t.TransactionDate.Month == currentMonth && t.TransactionDate.Year == currentYear),
                        SpentThisMonth = userTransactions
                            .Where(t => {
                                if (t.TransactionDate.Month != currentMonth || t.TransactionDate.Year != currentYear)
                                    return false;
                                    
                                bool isSender = t.FromAccountId.HasValue && userAccountIds.Contains(t.FromAccountId.Value);
                                bool isReceiver = t.ToAccountId.HasValue && userAccountIds.Contains(t.ToAccountId.Value);
                                
                                return (t.TransactionType == TransactionType.Withdrawal && isSender) ||
                                       (t.TransactionType == TransactionType.Transfer && isSender && !isReceiver);
                            })
                            .Sum(t => t.Amount),
                        ReceivedThisMonth = userTransactions
                            .Where(t => {
                                if (t.TransactionDate.Month != currentMonth || t.TransactionDate.Year != currentYear)
                                    return false;
                                    
                                bool isSender = t.FromAccountId.HasValue && userAccountIds.Contains(t.FromAccountId.Value);
                                bool isReceiver = t.ToAccountId.HasValue && userAccountIds.Contains(t.ToAccountId.Value);
                                
                                return (t.TransactionType == TransactionType.Deposit && isReceiver && !isSender) ||
                                       (t.TransactionType == TransactionType.Transfer && isReceiver && !isSender);
                            })
                            .Sum(t => t.Amount)
                    },
                    
                    // Account Details (to replace accountService.getMyAccounts())
                    accountDetails = accounts.Select(a => new
                    {
                        id = a.Id,
                        accountNumber = a.AccountNumber,
                        accountType = a.Type,
                        balance = a.Balance,
                        status = a.Status,
                        branchId = a.BranchId,
                        userId = a.UserId,
                        openedDate = a.CreatedAt.ToString("yyyy-MM-dd"),
                        isActive = a.Status == AccountStatus.Active,
                        lastTransactionDate = a.UpdatedAt?.ToString("yyyy-MM-dd"),
                        createdAt = a.CreatedAt.ToString("yyyy-MM-dd"),
                        updatedAt = a.UpdatedAt?.ToString("yyyy-MM-dd")
                    }).ToList(),
                    
                    // Profile Data (to replace /auth/profile call)
                    profileData = new
                    {
                        id = user.Id,
                        fullName = user.FullName,
                        email = user.Email,
                        phoneNumber = user.PhoneNumber,
                        dateOfBirth = user.DateOfBirth.ToString("yyyy-MM-dd"),
                        address = user.Address,
                        role = user.Role.ToString(),
                        isActive = user.IsActive,
                        branchId = user.BranchId
                    },
                    
                    // Minor Account Check Data (to replace useMinorAccountCheck hook calls)
                    minorAccountCheck = new
                    {
                        userAge = userAge,
                        hasMinorAccounts = hasMinorAccounts,
                        isMinorAccountBlocked = isMinorAccountBlocked
                    }
                };

                return ServiceResult<object>.SuccessResult(dashboard, "Complete customer dashboard data retrieved successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<object>.FailureResult($"Failed to retrieve complete customer dashboard: {ex.Message}");
            }
        }

        public async Task<ServiceResult<object>> GetAdminSuperDashboardAsync()
        {
            try
            {
                // Get ALL data in parallel - everything the admin dashboard needs
                var branchesTask = _branchRepository.GetAllAsync();
                var customersTask = _userRepository.GetAllUsersAsync();
                var accountsTask = _accountRepository.GetAllAccountsAsync();
                var transactionsTask = _transactionRepository.GetAllTransactionsAsync();

                await Task.WhenAll(branchesTask, customersTask, accountsTask, transactionsTask);

                var branches = branchesTask.Result.ToList();
                var customers = customersTask.Result.ToList();
                var accounts = accountsTask.Result.ToList();
                var transactions = transactionsTask.Result.ToList();

                var currentMonth = DateTime.UtcNow.Month;
                var currentYear = DateTime.UtcNow.Year;

                // Build complete dashboard with ALL data
                var superDashboard = new
                {
                    // Overview Stats
                    overviewStats = new
                    {
                        TotalBranches = branches.Count,
                        TotalCustomers = customers.Count,
                        TotalAccounts = accounts.Count,
                        PendingAccounts = accounts.Count(a => a.Status == AccountStatus.Pending),
                        TotalDeposits = accounts.Sum(a => a.Balance),
                        TotalTransactions = transactions.Count,
                        PendingTransactions = transactions.Count(t => t.Status == TransactionStatus.Pending),
                        MonthlyTransactionVolume = transactions
                            .Where(t => t.TransactionDate.Month == currentMonth && t.TransactionDate.Year == currentYear)
                            .Sum(t => t.Amount)
                    },

                    // Branch Performance
                    branchPerformance = branches.Select(b => {
                        var branchAccounts = accounts.Where(a => a.BranchId == b.Id).ToList();
                        var branchAccountIds = branchAccounts.Select(a => a.Id).ToHashSet();
                        var branchTransactions = transactions.Where(t => 
                            (t.FromAccountId.HasValue && branchAccountIds.Contains(t.FromAccountId.Value)) ||
                            (t.ToAccountId.HasValue && branchAccountIds.Contains(t.ToAccountId.Value))
                        ).ToList();
                        
                        var monthlyTransactions = branchTransactions.Where(t => 
                            t.TransactionDate.Month == currentMonth && t.TransactionDate.Year == currentYear
                        ).ToList();
                        
                        return new
                        {
                            BranchId = b.Id,
                            BranchName = b.BranchName ?? "",
                            BranchCode = b.BranchCode ?? "",
                            TotalAccounts = branchAccounts.Count,
                            ActiveAccounts = branchAccounts.Count(a => a.Status == AccountStatus.Active),
                            TotalDeposits = branchAccounts.Sum(a => a.Balance),
                            TransactionsThisMonth = monthlyTransactions.Count,
                            TransactionVolumeThisMonth = monthlyTransactions.Sum(t => t.Amount)
                        };
                    }).ToList(),

                    // Transaction Trends (Last 30 days)
                    transactionTrends = transactions
                        .Where(t => t.TransactionDate >= DateTime.UtcNow.AddDays(-30))
                        .GroupBy(t => t.TransactionDate.Date)
                        .Select(g => new
                        {
                            Date = g.Key,
                            TransactionCount = g.Count(),
                            TransactionVolume = g.Sum(t => t.Amount),
                            DepositCount = g.Count(t => t.TransactionType == TransactionType.Deposit),
                            WithdrawalCount = g.Count(t => t.TransactionType == TransactionType.Withdrawal),
                            TransferCount = g.Count(t => t.TransactionType == TransactionType.Transfer)
                        })
                        .OrderBy(t => t.Date)
                        .ToList(),

                    // Account Type Distribution
                    accountTypeDistribution = accounts
                        .GroupBy(a => a.Type)
                        .Select(g => new
                        {
                            AccountType = g.Key.ToString(),
                            Count = g.Count(),
                            Percentage = accounts.Count > 0 ? (decimal)g.Count() / accounts.Count * 100 : 0,
                            TotalBalance = g.Sum(a => a.Balance)
                        })
                        .ToList(),

                    // Recent Activities (Last 10)
                    recentActivities = transactions
                        .OrderByDescending(t => t.TransactionDate)
                        .Take(10)
                        .Select(t => {
                            var fromAccount = t.FromAccountId.HasValue ? accounts.FirstOrDefault(a => a.Id == t.FromAccountId.Value) : null;
                            var toAccount = t.ToAccountId.HasValue ? accounts.FirstOrDefault(a => a.Id == t.ToAccountId.Value) : null;
                            var fromUser = fromAccount != null ? customers.FirstOrDefault(u => u.Id == fromAccount.UserId) : null;
                            var toUser = toAccount != null ? customers.FirstOrDefault(u => u.Id == toAccount.UserId) : null;
                            var fromBranch = fromAccount != null ? branches.FirstOrDefault(b => b.Id == fromAccount.BranchId) : null;
                            var toBranch = toAccount != null ? branches.FirstOrDefault(b => b.Id == toAccount.BranchId) : null;
                            
                            // For admin view, show the primary user involved in the transaction
                            string primaryUser;
                            string primaryBranch;
                            
                            switch (t.TransactionType)
                            {
                                case TransactionType.Deposit:
                                    // For deposits, show the receiver (to account)
                                    primaryUser = toUser?.FullName ?? "Unknown User";
                                    primaryBranch = toBranch?.BranchName ?? "Unknown Branch";
                                    break;
                                case TransactionType.Withdrawal:
                                    // For withdrawals, show the sender (from account)
                                    primaryUser = fromUser?.FullName ?? "Unknown User";
                                    primaryBranch = fromBranch?.BranchName ?? "Unknown Branch";
                                    break;
                                case TransactionType.Transfer:
                                    // For transfers, show the sender (from account)
                                    primaryUser = fromUser?.FullName ?? "Unknown User";
                                    primaryBranch = fromBranch?.BranchName ?? "Unknown Branch";
                                    break;
                                default:
                                    primaryUser = fromUser?.FullName ?? toUser?.FullName ?? "Unknown User";
                                    primaryBranch = fromBranch?.BranchName ?? toBranch?.BranchName ?? "Unknown Branch";
                                    break;
                            }
                            
                            return new
                            {
                                ActivityType = t.TransactionType.ToString(),
                                Description = t.Description ?? $"{t.TransactionType} of ₹{t.Amount:N2}",
                                Timestamp = t.TransactionDate,
                                UserName = primaryUser,
                                BranchName = primaryBranch,
                                Amount = t.Amount,
                                TransactionType = t.TransactionType.ToString(),
                                FromAccountNumber = fromAccount?.AccountNumber ?? "",
                                ToAccountNumber = toAccount?.AccountNumber ?? "",
                                Status = t.Status.ToString()
                            };
                        })
                        .ToList(),

                    // ALL Branches data (to avoid separate branch API calls)
                    allBranches = branches.Select(b => new
                    {
                        id = b.Id,
                        branchName = b.BranchName,
                        branchCode = b.BranchCode,
                        branchType = (int)b.BranchType,
                        city = b.City,
                        state = b.State,
                        phoneNumber = b.PhoneNumber,
                        email = b.Email,
                        isActive = b.IsActive,
                        address = b.Address,
                        pincode = b.PostalCode,
                        managerId = (int?)null,
                        createdAt = b.CreatedAt
                    }).ToList(),

                    // Branch Manager Status for each branch
                    branchManagerStatus = branches.Select(b => new
                    {
                        branchId = b.Id,
                        hasManager = false,
                        managerId = (int?)null,
                        managerName = b.ManagerName
                    }).ToList(),

                    // All Accounts data
                    allAccounts = accounts.Take(100).Select(a => new // Limit to first 100 for performance
                    {
                        id = a.Id,
                        accountNumber = a.AccountNumber,
                        type = a.Type.ToString(),
                        balance = a.Balance,
                        status = a.Status.ToString(),
                        branchId = a.BranchId,
                        userId = a.UserId,
                        createdAt = a.CreatedAt
                    }).ToList(),

                    // All Transactions data (recent 100)
                    allTransactions = transactions.OrderByDescending(t => t.TransactionDate).Take(100).Select(t => new
                    {
                        id = t.Id,
                        transactionId = t.Id.ToString(),
                        amount = t.Amount,
                        transactionType = t.TransactionType.ToString(),
                        status = t.Status.ToString(),
                        description = t.Description,
                        transactionDate = t.TransactionDate,
                        fromAccountId = t.FromAccountId,
                        toAccountId = t.ToAccountId
                    }).ToList()
                };

                return ServiceResult<object>.SuccessResult(superDashboard, "Admin super dashboard data retrieved successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<object>.FailureResult($"Failed to retrieve admin super dashboard: {ex.Message}");
            }
        }

    }
}
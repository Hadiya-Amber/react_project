using OnlineBank.Core.Common;
using OnlineBank.Core.Interfaces;
using OnlineBank.Core.Repositories;
using OnlineBank.Core.Repository;
using OnlineBank.Core.Enums;

namespace OnlineBankSimulation.Application.Services
{
    public class StatsService : IStatsService
    {
        private readonly IUserRepository _userRepository;
        private readonly IBranchRepository _branchRepository;
        private readonly IAccountRepository _accountRepository;
        private readonly ITransactionRepository _transactionRepository;

        public StatsService(
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

        public async Task<ServiceResult<object>> GetBankOverviewAsync()
        {
            try
            {
                var branches = await _branchRepository.GetAllAsync();
                var accounts = await _accountRepository.GetAllAccountsAsync();
                var transactions = await _transactionRepository.GetAllTransactionsAsync();
                var users = await _userRepository.GetAllUsersAsync();

                var branchList = branches.ToList();
                var accountList = accounts.ToList();
                var transactionList = transactions.ToList();
                var userList = users.ToList();

                // Calculate active users (users who have made transactions in the last 30 days)
                var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
                var activeUserIds = transactionList
                    .Where(t => t.TransactionDate >= thirtyDaysAgo)
                    .SelectMany(t => new[] { 
                        t.FromAccountId.HasValue ? accountList.FirstOrDefault(a => a.Id == t.FromAccountId.Value)?.UserId : null,
                        t.ToAccountId.HasValue ? accountList.FirstOrDefault(a => a.Id == t.ToAccountId.Value)?.UserId : null
                    })
                    .Where(userId => userId.HasValue)
                    .Select(userId => userId.Value)
                    .Distinct()
                    .Count();

                var bankStats = new
                {
                    totalAccounts = accountList.Count,
                    totalTransactions = transactionList.Count,
                    activeUsers = activeUserIds,
                    totalBranches = branchList.Count
                };

                return ServiceResult<object>.SuccessResult(bankStats, "Bank overview statistics retrieved successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<object>.FailureResult($"Failed to retrieve bank overview statistics: {ex.Message}");
            }
        }
    }
}
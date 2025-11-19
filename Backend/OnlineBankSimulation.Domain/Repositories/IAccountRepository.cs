using OnlineBank.Core.Models;
using OnlineBank.Core.Enums;

namespace OnlineBank.Core.Repositories
{
    public interface IAccountRepository : IGenericRepository<Account>
    {
        Task<IEnumerable<Account>> GetAllAccountsAsync();
        Task<Account?> GetAccountByIdAsync(int id);
        Task<Account?> GetByAccountNumberAsync(string accountNumber);
        Task<IEnumerable<Account>> GetAccountsByUserIdAsync(int userId);
        Task<IEnumerable<Account>> GetAccountsByBranchIdAsync(int branchId);
        Task AddAccountAsync(Account account);
        void UpdateAccount(Account account);
        void DeleteAccount(Account account);
        Task SaveAsync();
        Task UpdateAsync(Account account);
        Task UpdateBalanceAsync(int accountId, decimal newBalance);
        
        // Missing methods
        Task<IEnumerable<Account>> GetByUserIdAsync(int userId);
        Task<IEnumerable<Account>> GetPendingAccountsAsync();
        Task<IEnumerable<Account>> GetPendingAccountsByBranchAsync(int branchId);
        Task<IEnumerable<Account>> GetAccountsByStatusAsync(AccountStatus status);
        Task<IEnumerable<Account>> GetAccountsByTypeAsync(AccountType type);
        Task<IEnumerable<Account>> GetMinorAccountsAsync();
    }
}
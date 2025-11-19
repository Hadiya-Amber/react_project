using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using OnlineBank.Core.Models;
using OnlineBankSimulation.Application.Data;
using OnlineBank.Core.Repository;
using OnlineBank.Core.Repositories;
using OnlineBank.Core.Enums;
using System.Data;
using Dapper;

namespace OnlineBankSimulation.Application.Repositories
{
    public class AccountRepository : GenericRepository<Account>, IAccountRepository
    {
        public override async Task<IEnumerable<Account>> GetAllAsync()
        {
            return await _context.Accounts
                .Include(a => a.User)
                .Include(a => a.Branch)
                .Where(a => !a.IsDeleted)
                .ToListAsync();
        }
        private readonly OnlineBankDbContext _context;
        private readonly string _connectionString;

        public AccountRepository(OnlineBankDbContext context, IConfiguration configuration) : base(context)
        {
            _context = context;
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
        }

        public async Task<IEnumerable<Account>> GetAllAccountsAsync()
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                var accounts = await connection.QueryAsync<Account>("GetAllAccounts", commandType: CommandType.StoredProcedure);
                return accounts;
            }
            catch (Exception)
            {
                // Fallback to EF Core if stored procedure fails
                return await _context.Accounts
                    .Include(a => a.User)
                    .Include(a => a.Branch)
                    .Where(a => !a.IsDeleted)
                    .ToListAsync();
            }
        }

        public async Task<Account?> GetAccountByIdAsync(int id)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                var parameters = new { UserId = id };
                var account = await connection.QueryFirstOrDefaultAsync<Account>(
                    "GetAccountById", 
                    parameters, 
                    commandType: CommandType.StoredProcedure);
                return account;
            }
            catch (Exception)
            {
                // Fallback to EF Core if stored procedure fails
                return await _context.Accounts
                    .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);
            }
        }
        
        public async Task<Account?> GetByAccountNumberAsync(string accountNumber)
        {
            return await _context.Accounts
                .Include(a => a.User)
                .Include(a => a.Branch)
                .FirstOrDefaultAsync(a => a.AccountNumber == accountNumber && !a.IsDeleted);
        }

        public async Task<IEnumerable<Account>> GetAccountsByUserIdAsync(int userId)
        {
            return await _context.Accounts
                .Include(a => a.User)
                .Include(a => a.Branch)
                .Where(a => a.UserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Account>> GetAccountsByBranchIdAsync(int branchId)
        {
            return await _context.Accounts
                .Include(a => a.User)
                .Include(a => a.Branch)
                .Where(a => a.BranchId == branchId && !a.IsDeleted)
                .ToListAsync();
        }

        public async Task AddAccountAsync(Account account)
        {
            await _context.Accounts.AddAsync(account);
        }

        public void UpdateAccount(Account account)
        {
            _context.Accounts.Update(account);
        }

        public void DeleteAccount(Account account)
        {
            _context.Accounts.Remove(account);
        }

        public async Task SaveAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Account account)
        {
            _context.Accounts.Update(account);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateBalanceAsync(int accountId, decimal newBalance)
        {
            var account = await _context.Accounts.FindAsync(accountId);
            if (account != null)
            {
                account.Balance = newBalance;
                account.LastTransactionDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        // Methods using stored procedures for all read operations
        public async Task<IEnumerable<Account>> GetByUserIdAsync(int userId)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                var parameters = new { UserId = userId };
                var accounts = await connection.QueryAsync<Account>(
                    "GetAccountsByUserId", 
                    parameters, 
                    commandType: CommandType.StoredProcedure);
                return accounts;
            }
            catch (Exception)
            {
                return await _context.Accounts
                    .Include(a => a.User)
                    .Include(a => a.Branch)
                    .Where(a => a.UserId == userId && !a.IsDeleted)
                    .ToListAsync();
            }
        }

        public async Task<IEnumerable<Account>> GetAccountsByStatusAsync(AccountStatus status)
        {
            return await _context.Accounts
                .Include(a => a.User)
                .Include(a => a.Branch)
                .Where(a => a.Status == status && !a.IsDeleted)
                .ToListAsync();
        }

        public async Task<IEnumerable<Account>> GetAccountsByTypeAsync(AccountType type)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                var parameters = new { AccountType = (int)type };
                var accounts = await connection.QueryAsync<Account>(
                    "GetAccountsByType", 
                    parameters, 
                    commandType: CommandType.StoredProcedure);
                return accounts;
            }
            catch (Exception)
            {
                return await _context.Accounts
                    .Where(a => a.Type == type && !a.IsDeleted)
                    .ToListAsync();
            }
        }

        public async Task<IEnumerable<Account>> GetPendingAccountsAsync()
        {
            return await _context.Accounts
                .Include(a => a.User)
                .Include(a => a.Branch)
                .Where(a => a.Status == AccountStatus.Pending && !a.IsDeleted)
                .ToListAsync();
        }

        public async Task<IEnumerable<Account>> GetPendingAccountsByBranchAsync(int branchId)
        {
            return await _context.Accounts
                .Include(a => a.User)
                .Include(a => a.Branch)
                .Where(a => a.BranchId == branchId && a.Status == AccountStatus.Pending && !a.IsDeleted)
                .ToListAsync();
        }

        public async Task<IEnumerable<Account>> GetMinorAccountsAsync()
        {
            return await GetAccountsByTypeAsync(AccountType.Minor);
        }

        public async Task<IEnumerable<dynamic>> GetAccountTypeAnalyticsAsync()
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                var analytics = await connection.QueryAsync(
                    "GetAccountTypeAnalytics", 
                    commandType: CommandType.StoredProcedure);
                return analytics;
            }
            catch (Exception)
            {
                return new List<dynamic>();
            }
        }

        public async Task<decimal> GetTotalBalanceByTypeAsync(AccountType type)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                var parameters = new { AccountType = (int)type };
                var result = await connection.QueryFirstOrDefaultAsync<decimal>(
                    "GetTotalBalanceByType", 
                    parameters, 
                    commandType: CommandType.StoredProcedure);
                return result;
            }
            catch (Exception)
            {
                return await _context.Accounts
                    .Where(a => a.Type == type && !a.IsDeleted && a.Status == AccountStatus.Active)
                    .SumAsync(a => a.Balance);
            }
        }
    }
}
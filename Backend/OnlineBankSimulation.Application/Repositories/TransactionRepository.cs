using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;
using OnlineBank.Core.Models;
using OnlineBank.Core.Enums;
using OnlineBankSimulation.Application.Data;
using OnlineBank.Core.Repository;
using System.Data;
using Dapper;

namespace OnlineBankSimulation.Application.Repositories
{
    public class TransactionRepository : GenericRepository<Transaction>, ITransactionRepository
    {
        private readonly OnlineBankDbContext _context;
        private readonly string _connectionString;

        public TransactionRepository(OnlineBankDbContext context, IConfiguration configuration) : base(context)
        {
            _context = context;
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
        }

        public async Task<IEnumerable<Transaction>> GetAllTransactionsAsync(int page = 1, int pageSize = 50)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                var transactions = await connection.QueryAsync<Transaction>(
                    "GetAllTransactions", 
                    commandType: CommandType.StoredProcedure);
                return transactions.Skip((page - 1) * pageSize).Take(pageSize);
            }
            catch (Exception)
            {
                // Fallback to EF Core
                return await _context.Transactions
                    .Where(t => !t.IsDeleted)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
            }
        }

        public async Task<Transaction?> GetTransactionByIdAsync(int id)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                var parameters = new { TransactionId = id };
                var transaction = await connection.QueryFirstOrDefaultAsync<Transaction>(
                    "GetTransactionById", 
                    parameters, 
                    commandType: CommandType.StoredProcedure);
                return transaction;
            }
            catch (Exception)
            {
                // Fallback to EF Core
                return await _context.Transactions
                    .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);
            }
        }

        public async Task<IEnumerable<Transaction>> GetTransactionsByAccountIdAsync(int accountId, int page = 1, int pageSize = 50)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                var parameters = new { AccountId = accountId };
                var transactions = await connection.QueryAsync<Transaction>(
                    "GetTransactionsByAccountId", 
                    parameters, 
                    commandType: CommandType.StoredProcedure);
                return transactions.Skip((page - 1) * pageSize).Take(pageSize);
            }
            catch (Exception)
            {
                // Fallback to EF Core
                return await _context.Transactions
                    .Where(t => (t.FromAccountId == accountId || t.ToAccountId == accountId) && !t.IsDeleted)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .OrderByDescending(t => t.TransactionDate)
                    .ToListAsync();
            }
        }

        public async Task AddTransactionAsync(Transaction transaction)
        {
            await _context.Transactions.AddAsync(transaction);
        }

        public void UpdateTransaction(Transaction transaction)
        {
            _context.Transactions.Update(transaction);
        }

        public void DeleteTransaction(Transaction transaction)
        {
            _context.Transactions.Remove(transaction);
        }

        public async Task SaveAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Transaction transaction)
        {
            _context.Transactions.Update(transaction);
            await _context.SaveChangesAsync();
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await _context.Database.BeginTransactionAsync();
        }

        // Methods using stored procedures for all read operations
        public async Task<IEnumerable<Transaction>> GetTransactionsByStatusAsync(TransactionStatus status)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                var parameters = new { Status = (int)status };
                var transactions = await connection.QueryAsync<Transaction>(
                    "GetTransactionsByStatus", 
                    parameters, 
                    commandType: CommandType.StoredProcedure);
                return transactions;
            }
            catch (Exception)
            {
                return await _context.Transactions
                    .Where(t => t.Status == status && !t.IsDeleted)
                    .OrderByDescending(t => t.TransactionDate)
                    .ToListAsync();
            }
        }

        public async Task<IEnumerable<Transaction>> GetTransactionsByTypeAsync(TransactionType type)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                var parameters = new { TransactionType = (int)type };
                var transactions = await connection.QueryAsync<Transaction>(
                    "GetTransactionsByType", 
                    parameters, 
                    commandType: CommandType.StoredProcedure);
                return transactions;
            }
            catch (Exception)
            {
                return await _context.Transactions
                    .Where(t => t.TransactionType == type && !t.IsDeleted)
                    .OrderByDescending(t => t.TransactionDate)
                    .ToListAsync();
            }
        }

        public async Task<IEnumerable<Transaction>> GetPendingTransactionsAsync()
        {
            return await GetTransactionsByStatusAsync(TransactionStatus.Pending);
        }

        public async Task<IEnumerable<Transaction>> GetCompletedTransactionsAsync()
        {
            return await GetTransactionsByStatusAsync(TransactionStatus.Completed);
        }

        public async Task<IEnumerable<Transaction>> GetFailedTransactionsAsync()
        {
            return await GetTransactionsByStatusAsync(TransactionStatus.Failed);
        }

        public async Task<IEnumerable<Transaction>> GetTransactionsRequiringApprovalAsync()
        {
            return await GetTransactionsByStatusAsync(TransactionStatus.Pending);
        }

        public async Task<decimal> GetTotalTransactionAmountByTypeAsync(TransactionType type, DateTime fromDate, DateTime toDate)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                var parameters = new { 
                    TransactionType = (int)type,
                    FromDate = fromDate,
                    ToDate = toDate 
                };
                var result = await connection.QueryFirstOrDefaultAsync<decimal?>(
                    "GetTotalTransactionAmountByType",
                    parameters,
                    commandType: CommandType.StoredProcedure);
                return result ?? 0;
            }
            catch (Exception)
            {
                return await _context.Transactions
                    .Where(t => t.TransactionType == type && 
                               t.TransactionDate >= fromDate && 
                               t.TransactionDate <= toDate && 
                               t.Status == TransactionStatus.Completed &&
                               !t.IsDeleted)
                    .SumAsync(t => t.Amount);
            }
        }

        public async Task<IEnumerable<dynamic>> GetTransactionAnalyticsAsync(DateTime fromDate, DateTime toDate)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                var parameters = new { FromDate = fromDate, ToDate = toDate };
                var analytics = await connection.QueryAsync(
                    "GetTransactionAnalytics", 
                    parameters, 
                    commandType: CommandType.StoredProcedure);
                return analytics;
            }
            catch (Exception)
            {
                return new List<dynamic>();
            }
        }
    }
}
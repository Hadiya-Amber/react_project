using OnlineBank.Core.Models;
using OnlineBank.Core.Repositories;
using Microsoft.EntityFrameworkCore.Storage;

namespace OnlineBank.Core.Repository
{
    public interface ITransactionRepository : IGenericRepository<Transaction>
    {
        Task<IEnumerable<Transaction>> GetAllTransactionsAsync(int page = 1, int pageSize = 50);
        Task<Transaction?> GetTransactionByIdAsync(int id);
        Task<IEnumerable<Transaction>> GetTransactionsByAccountIdAsync(int accountId, int page = 1, int pageSize = 50);
        Task AddTransactionAsync(Transaction transaction);
        void UpdateTransaction(Transaction transaction);
        void DeleteTransaction(Transaction transaction);
        Task SaveAsync();
        Task UpdateAsync(Transaction transaction);
        Task<IDbContextTransaction> BeginTransactionAsync();
    }
}
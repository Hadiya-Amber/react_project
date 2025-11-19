using OnlineBank.Core.Models;
using OnlineBank.Core.Repository;

namespace OnlineBank.Core.Repositories
{
    public interface IBranchRepository : IGenericRepository<Branch>
    {
        Task<Branch?> GetMainBranchAsync();
        Task<IEnumerable<Branch>> GetActiveBranchesAsync();
    }
}
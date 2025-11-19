using OnlineBank.Core.Enums;
using OnlineBank.Core.Models;
using OnlineBank.Core.Repository;

namespace OnlineBank.Core.Repositories
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User?> GetUserByIdAsync(int id);
        Task<User?> GetByEmailAsync(string email);
        Task<IEnumerable<User>> GetUsersByStatusAsync(UserStatus status);
        Task<IEnumerable<User>> GetBranchManagersAsync();
        Task<bool> HasBranchManagerAsync(int branchId);
    Task<User?> GetBranchManagerByBranchIdAsync(int branchId);
        Task AddUserAsync(User user);
        void UpdateUser(User user);
        void DeleteUser(User user);
        Task SaveAsync();
        Task UpdateAsync(User user);
    }
}
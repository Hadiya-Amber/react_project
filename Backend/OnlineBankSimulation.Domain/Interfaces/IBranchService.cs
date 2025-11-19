using OnlineBank.Core.DTOs.BranchDtos;
using OnlineBank.Core.DTOs.AccountDtos;

namespace OnlineBank.Core.Interfaces
{
    public interface IBranchService
    {
        Task<IEnumerable<BranchReadDto>> GetAllAsync();
        Task<(bool Success, string Message)> CreateAsync(CreateBranchDto dto);
        Task<(bool Success, string Message, IEnumerable<BranchReadDto>? Data)> GetAllActiveAsync();
        Task<(bool Success, string Message, object? Data)> GetByIdAsync(int branchId);
        Task<(bool Success, string Message, IEnumerable<AccountReadDto>? Data)> GetBranchAccountsAsync(int branchId);
        Task<(bool Success, string Message)> UpdateAsync(int branchId, UpdateBranchDto dto);
        Task<(bool Success, string Message, IEnumerable<BranchReadDto>? Data)> GetBranchesByTypeAsync(int branchType);
        Task<bool> HasBranchManagerAsync(int branchId);
    Task<BranchDetailDto?> GetBranchDetailAsync(int id);
    }
}
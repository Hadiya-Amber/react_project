using System.Collections.Generic;
using System.Threading.Tasks;
using OnlineBank.Core.DTOs.AccountDtos;
using OnlineBank.Core.DTOs;
using OnlineBank.Core.DTOs.AnalyticsDtos;
using OnlineBank.Core.Enums;

namespace OnlineBank.Core.Interfaces
{
    public interface IAccountService
    {
        Task<IEnumerable<AccountReadDto>> GetAllAsync(int pageNumber, int pageSize, string? searchTerm = null);
        Task<AccountReadDto?> GetByIdAsync(int id);
        Task<AccountReadDto> CreateAsync(AccountCreateDto dto, int userId);
        Task<AccountReadDto> CreateAccountAsync(CreateAccountDto dto, int userId);
        Task<bool> VerifyAccountAsync(int accountId, VerifyAccountDto dto, int verifiedBy);
        Task<bool> UpdateAccountStatusToDormantAsync();
        Task<AccountReadDto> UpdateAsync(int id, AccountUpdateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<AccountReadDto>> GetByUserIdAsync(int userId);
        Task<bool> ApproveAccountAsync(int id);
        Task<IEnumerable<AccountReadDto>> GetPendingAccountsAsync();
        Task<IEnumerable<AccountReadDto>> GetPendingAccountsByBranchAsync(int branchId);
        Task<bool> VerifyAccountByBranchManagerAsync(int accountId, VerifyAccountDto dto, int branchManagerId);
        
        // Enhanced account methods
        Task<AccountReadDto> CreateAccountWithClassificationAsync(CreateAccountDto dto, int userId);
        Task<bool> ProcessMinorToMajorTransitionsAsync();
        Task<bool> TransitionAccountStatusAsync(int accountId, AccountStatus newStatus, int updatedBy, string? remarks = null);
        
        // Analytics methods
        Task<AccountTypeAnalyticsDto> GetAccountTypeAnalyticsAsync();
        Task<GenderInvestmentAnalyticsDto> GetGenderInvestmentAnalyticsAsync();
        Task<IEnumerable<AgeGroupAnalyticsDto>> GetAgeGroupAnalyticsAsync();
    }
}

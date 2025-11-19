using AutoMapper;
using Microsoft.Extensions.Logging;
using OnlineBank.Core.DTOs.AccountDtos;
using OnlineBank.Core.DTOs;
using OnlineBank.Core.DTOs.AnalyticsDtos;
using OnlineBank.Core.Models;
using OnlineBank.Core.Repository;
using OnlineBank.Core.Repositories;
using OnlineBank.Core.Enums;
using OnlineBank.Core.Interfaces;
using OnlineBank.Core.Constants;
using FluentValidation;

namespace OnlineBankSimulation.Application.Services
{
    public class AccountService : IAccountService
    {
        private readonly IAccountRepository _accountRepository;
        private readonly IUserRepository _userRepository;
        private readonly IBranchRepository _branchRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<AccountService> _logger;
        private readonly IValidator<AccountCreateDto> _accountCreateValidator;

        public AccountService(
            IAccountRepository accountRepository,
            IUserRepository userRepository,
            IBranchRepository branchRepository,
            IMapper mapper,
            ILogger<AccountService> logger,
            IValidator<AccountCreateDto> accountCreateValidator)
        {
            _accountRepository = accountRepository;
            _userRepository = userRepository;
            _branchRepository = branchRepository;
            _mapper = mapper;
            _logger = logger;
            _accountCreateValidator = accountCreateValidator;
        }

        public async Task<IEnumerable<AccountReadDto>> GetAllAsync(int pageNumber, int pageSize, string? searchTerm = null)
        {
            try
            {
                var accounts = await _accountRepository.GetAllAsync();
                return _mapper.Map<IEnumerable<AccountReadDto>>(accounts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all accounts");
                return new List<AccountReadDto>();
            }
        }

        public async Task<AccountReadDto?> GetByIdAsync(int id)
        {
            try
            {
                var account = await _accountRepository.GetByIdAsync(id);
                return account != null ? _mapper.Map<AccountReadDto>(account) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting account by ID: {Id}", id);
                return null;
            }
        }

        public async Task<AccountReadDto> CreateAsync(AccountCreateDto dto, int userId)
        {
            try
            {
                // Validate input using FluentValidation
                var validationResult = await _accountCreateValidator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    _logger.LogWarning("Account creation validation failed for user: {UserId}", userId);
                    return new AccountReadDto();
                }

                // Check if user exists
                var user = await _userRepository.GetUserByIdAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning(AccountMessages.AccountNotFound);
                    return new AccountReadDto();
                }

                var account = _mapper.Map<Account>(dto);
                account.UserId = userId;
                account.AccountNumber = await GenerateAccountNumberAsync(dto.BranchId);
                account.Status = AccountStatus.Pending;
                
                await _accountRepository.AddAsync(account);
                await _accountRepository.SaveChangesAsync();
                
                _logger.LogInformation(AccountMessages.AccountCreated);
                return _mapper.Map<AccountReadDto>(account);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, AccountMessages.UnexpectedError);
                return new AccountReadDto();
            }
        }

        public async Task<AccountReadDto> CreateAccountAsync(CreateAccountDto dto, int userId)
        {
            try
            {
                // Check if user already has an account of this type
                var existingAccounts = await _accountRepository.GetByUserIdAsync(userId);
                var hasExistingAccountType = existingAccounts.Any(a => a.Type == dto.AccountType && a.Status != AccountStatus.Closed && a.Status != AccountStatus.Rejected);
                
                if (hasExistingAccountType)
                {
                    _logger.LogWarning("User {UserId} already has an active account of type {AccountType}", userId, dto.AccountType);
                    return new AccountReadDto(); // Return empty DTO instead of throwing
                }

                var account = _mapper.Map<Account>(dto);
                account.UserId = userId;
                account.AccountNumber = await GenerateAccountNumberAsync(dto.BranchId);
                account.Status = AccountStatus.Pending; // Set initial status as pending
                account.CreatedAt = DateTime.UtcNow;
                account.UpdatedAt = DateTime.UtcNow;
                
                await _accountRepository.AddAsync(account);
                await _accountRepository.SaveChangesAsync();
                
                _logger.LogInformation("Account created successfully for user {UserId} with account number {AccountNumber}", userId, account.AccountNumber);
                return _mapper.Map<AccountReadDto>(account);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating account for user: {UserId}", userId);
                return new AccountReadDto(); // Return empty DTO instead of throwing
            }
        }

        public async Task<bool> VerifyAccountAsync(int accountId, VerifyAccountDto dto, int verifiedBy)
        {
            try
            {
                var account = await _accountRepository.GetByIdAsync(accountId);
                if (account == null)
                {
                    _logger.LogWarning(AccountMessages.AccountNotFound);
                    return false;
                }
                
                if (account.Status != AccountStatus.Pending)
                {
                    _logger.LogWarning(AccountMessages.AccountNotPending);
                    return false;
                }
                
                account.Status = AccountStatus.Active;
                account.UpdatedAt = DateTime.UtcNow;
                account.UpdatedBy = verifiedBy.ToString();
                
                await _accountRepository.UpdateAsync(account);
                await _accountRepository.SaveChangesAsync();
                
                _logger.LogInformation(AccountMessages.AccountVerified);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, AccountMessages.UnexpectedError);
                return false;
            }
        }

        public async Task<bool> UpdateAccountStatusToDormantAsync()
        {
            try
            {
                // Get active accounts with no transactions in last 12 months
                var cutoffDate = DateTime.UtcNow.AddMonths(-12);
                var accounts = await _accountRepository.GetAllAsync();
                var dormantAccounts = accounts.Where(a => 
                    a.Status == AccountStatus.Active && 
                    (a.LastTransactionDate == null || a.LastTransactionDate < cutoffDate)
                ).ToList();

                foreach (var account in dormantAccounts)
                {
                    account.Status = AccountStatus.Dormant;
                    account.UpdatedAt = DateTime.UtcNow;
                    await _accountRepository.UpdateAsync(account);
                }
                
                await _accountRepository.SaveChangesAsync();
                _logger.LogInformation("Updated {Count} accounts to dormant status", dormantAccounts.Count);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating accounts to dormant status");
                return false;
            }
        }

        public async Task<AccountReadDto> UpdateAsync(int id, AccountUpdateDto dto)
        {
            try
            {
                var account = await _accountRepository.GetByIdAsync(id);
                if (account == null) return new AccountReadDto();
                
                _mapper.Map(dto, account);
                await _accountRepository.UpdateAsync(account);
                await _accountRepository.SaveChangesAsync();
                
                return _mapper.Map<AccountReadDto>(account);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating account: {Id}", id);
                return new AccountReadDto();
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            try
            {
                var account = await _accountRepository.GetByIdAsync(id);
                if (account == null) return false;
                
                account.IsDeleted = true;
                await _accountRepository.UpdateAsync(account);
                await _accountRepository.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting account: {Id}", id);
                return false;
            }
        }

        public async Task<IEnumerable<AccountReadDto>> GetByUserIdAsync(int userId)
        {
            try
            {
                var accounts = await _accountRepository.GetByUserIdAsync(userId);
                return _mapper.Map<IEnumerable<AccountReadDto>>(accounts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting accounts for user: {UserId}", userId);
                return new List<AccountReadDto>();
            }
        }

        public async Task<bool> ApproveAccountAsync(int id)
        {
            try
            {
                var account = await _accountRepository.GetByIdAsync(id);
                if (account == null) return false;
                
                account.Status = AccountStatus.Active;
                await _accountRepository.UpdateAsync(account);
                await _accountRepository.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving account: {Id}", id);
                return false;
            }
        }

        public async Task<IEnumerable<AccountReadDto>> GetPendingAccountsAsync()
        {
            try
            {
                var accounts = await _accountRepository.GetPendingAccountsAsync();
                return _mapper.Map<IEnumerable<AccountReadDto>>(accounts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending accounts");
                return new List<AccountReadDto>();
            }
        }

        public async Task<IEnumerable<AccountReadDto>> GetPendingAccountsByBranchAsync(int branchId)
        {
            try
            {
                var accounts = await _accountRepository.GetPendingAccountsByBranchAsync(branchId);
                return _mapper.Map<IEnumerable<AccountReadDto>>(accounts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending accounts for branch: {BranchId}", branchId);
                return new List<AccountReadDto>();
            }
        }

        public async Task<bool> VerifyAccountByBranchManagerAsync(int accountId, VerifyAccountDto dto, int branchManagerId)
        {
            try
            {
                return await VerifyAccountAsync(accountId, dto, branchManagerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying account by branch manager: {AccountId}", accountId);
                return false;
            }
        }

        public async Task<AccountReadDto> CreateAccountWithClassificationAsync(CreateAccountDto dto, int userId)
        {
            try
            {
                return await CreateAccountAsync(dto, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating account with classification for user: {UserId}", userId);
                return new AccountReadDto();
            }
        }

        public async Task<bool> ProcessMinorToMajorTransitionsAsync()
        {
            try
            {
                // Get all minor accounts where user is now 18+
                var accounts = await _accountRepository.GetAccountsByTypeAsync(AccountType.Minor);
                var transitionedCount = 0;

                foreach (var account in accounts)
                {
                    var user = await _userRepository.GetUserByIdAsync(account.UserId);
                    if (user?.DateOfBirth != null)
                    {
                        var age = DateTime.UtcNow.Year - user.DateOfBirth.Year;
                        if (DateTime.UtcNow < user.DateOfBirth.AddYears(age)) age--;

                        if (age >= 18 && account.Type == AccountType.Minor)
                        {
                            // Transition to Major account
                            account.Type = AccountType.Major;
                            account.UpdatedAt = DateTime.UtcNow;
                            await _accountRepository.UpdateAsync(account);
                            transitionedCount++;
                        }
                    }
                }
                
                await _accountRepository.SaveChangesAsync();
                _logger.LogInformation("Transitioned {Count} minor accounts to major accounts", transitionedCount);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing minor to major transitions");
                return false;
            }
        }

        public async Task<bool> TransitionAccountStatusAsync(int accountId, AccountStatus newStatus, int updatedBy, string? remarks = null)
        {
            try
            {
                var account = await _accountRepository.GetByIdAsync(accountId);
                if (account == null) return false;
                
                account.Status = newStatus;
                account.UpdatedAt = DateTime.UtcNow;
                account.UpdatedBy = updatedBy.ToString();
                await _accountRepository.UpdateAsync(account);
                await _accountRepository.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error transitioning account status: {AccountId}", accountId);
                return false;
            }
        }

        public async Task<bool> CloseAccountAsync(int accountId, int closedBy, string? reason = null)
        {
            try
            {
                var account = await _accountRepository.GetByIdAsync(accountId);
                if (account == null) return false;
                
                if (account.Status != AccountStatus.Active && account.Status != AccountStatus.Dormant)
                {
                    return false;
                }
                
                if (account.Balance > 0)
                {
                    return false;
                }
                
                account.Status = AccountStatus.Closed;
                account.UpdatedAt = DateTime.UtcNow;
                account.UpdatedBy = closedBy.ToString();
                await _accountRepository.UpdateAsync(account);
                await _accountRepository.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error closing account: {AccountId}", accountId);
                return false;
            }
        }

        public async Task<bool> ReactivateAccountAsync(int accountId, int reactivatedBy)
        {
            try
            {
                var account = await _accountRepository.GetByIdAsync(accountId);
                if (account == null) return false;
                
                if (account.Status != AccountStatus.Dormant)
                {
                    return false;
                }
                
                account.Status = AccountStatus.Active;
                account.UpdatedAt = DateTime.UtcNow;
                account.UpdatedBy = reactivatedBy.ToString();
                await _accountRepository.UpdateAsync(account);
                await _accountRepository.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reactivating account: {AccountId}", accountId);
                return false;
            }
        }

        public async Task<AccountTypeAnalyticsDto> GetAccountTypeAnalyticsAsync()
        {
            try
            {
                return new AccountTypeAnalyticsDto();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting account type analytics");
                return new AccountTypeAnalyticsDto();
            }
        }

        public async Task<GenderInvestmentAnalyticsDto> GetGenderInvestmentAnalyticsAsync()
        {
            try
            {
                return new GenderInvestmentAnalyticsDto();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting gender investment analytics");
                return new GenderInvestmentAnalyticsDto();
            }
        }

        public async Task<IEnumerable<AgeGroupAnalyticsDto>> GetAgeGroupAnalyticsAsync()
        {
            try
            {
                return new List<AgeGroupAnalyticsDto>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting age group analytics");
                return new List<AgeGroupAnalyticsDto>();
            }
        }

        // Methods to handle all AccountStatus enum values
        public async Task<IEnumerable<AccountReadDto>> GetAccountsByStatusAsync(AccountStatus status)
        {
            try
            {
                var accounts = await _accountRepository.GetAccountsByStatusAsync(status);
                return _mapper.Map<IEnumerable<AccountReadDto>>(accounts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting accounts by status: {Status}", status);
                return new List<AccountReadDto>();
            }
        }

        public async Task<IEnumerable<AccountReadDto>> GetVerifiedAccountsAsync()
        {
            return await GetAccountsByStatusAsync(AccountStatus.Verified);
        }

        public async Task<IEnumerable<AccountReadDto>> GetDormantAccountsAsync()
        {
            return await GetAccountsByStatusAsync(AccountStatus.Dormant);
        }

        public async Task<IEnumerable<AccountReadDto>> GetClosedAccountsAsync()
        {
            return await GetAccountsByStatusAsync(AccountStatus.Closed);
        }

        public async Task<IEnumerable<AccountReadDto>> GetRejectedAccountsAsync()
        {
            return await GetAccountsByStatusAsync(AccountStatus.Rejected);
        }

        // Methods to handle all AccountType enum values
        public async Task<IEnumerable<AccountReadDto>> GetAccountsByTypeAsync(AccountType type)
        {
            try
            {
                var accounts = await _accountRepository.GetAccountsByTypeAsync(type);
                return _mapper.Map<IEnumerable<AccountReadDto>>(accounts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting accounts by type: {Type}", type);
                return new List<AccountReadDto>();
            }
        }

        public async Task<IEnumerable<AccountReadDto>> GetSavingsAccountsAsync()
        {
            return await GetAccountsByTypeAsync(AccountType.Savings);
        }

        public async Task<IEnumerable<AccountReadDto>> GetCurrentAccountsAsync()
        {
            return await GetAccountsByTypeAsync(AccountType.Current);
        }

        public async Task<IEnumerable<AccountReadDto>> GetMinorAccountsAsync()
        {
            return await GetAccountsByTypeAsync(AccountType.Minor);
        }

        public async Task<IEnumerable<AccountReadDto>> GetMajorAccountsAsync()
        {
            return await GetAccountsByTypeAsync(AccountType.Major);
        }



        private async Task<string> GenerateAccountNumberAsync(int branchId)
        {
            try
            {
                var branch = await _branchRepository.GetByIdAsync(branchId);
                var branchCode = branch?.BranchCode?.PadLeft(3, '0') ?? "001";
                var bankCode = "OBS"; // Online Bank Simulation
                var yearMonth = DateTime.UtcNow.ToString("yyMM"); // Use 2-digit year to save space
                var sequence = new Random().Next(10000, 99999); // 5-digit sequence to fit in 20 chars
                return $"{bankCode}{branchCode}{yearMonth}{sequence}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating account number for branch: {BranchId}", branchId);
                return $"OBS001{DateTime.UtcNow:yyMM}{new Random().Next(10000, 99999)}";
            }
        }
    }
}
using AutoMapper;
using OnlineBank.Core.DTOs.BranchDtos;
using OnlineBank.Core.DTOs.AccountDtos;
using OnlineBank.Core.Interfaces;
using OnlineBank.Core.Repositories;
using OnlineBank.Core.Models;
using OnlineBank.Core.Repository;
using OnlineBank.Core.Enums;
using Microsoft.Extensions.Logging;

namespace OnlineBankSimulation.Application.Services
{
    public class BranchService : IBranchService
    {
        private readonly IBranchRepository _branchRepository;
        private readonly IAccountRepository _accountRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<BranchService> _logger;

        public BranchService(IBranchRepository branchRepository, IAccountRepository accountRepository, IUserRepository userRepository, IMapper mapper, ILogger<BranchService> logger)
        {
            _branchRepository = branchRepository;
            _accountRepository = accountRepository;
            _userRepository = userRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<BranchReadDto>> GetAllAsync()
        {
            var branches = await _branchRepository.GetActiveBranchesAsync();
            return _mapper.Map<IEnumerable<BranchReadDto>>(branches);
        }

        public async Task<(bool Success, string Message)> CreateAsync(CreateBranchDto dto)
        {
            try
            {
                // Check for duplicate branch code
                var existingBranches = await _branchRepository.GetAllAsync();
                if (existingBranches.Any(b => b.BranchCode == dto.BranchCode))
                {
                    return (false, "Branch code already exists");
                }

                var branch = _mapper.Map<Branch>(dto);
                branch.CreatedAt = DateTime.UtcNow;
                branch.IsActive = true;
                branch.CreatedBy = "Admin";

                await _branchRepository.AddAsync(branch);
                await _branchRepository.SaveChangesAsync();

                return (true, "Branch created successfully");
            }
            catch (Exception ex)
            {
                return (false, $"Error: {ex.Message}");
            }
        }

        public async Task<(bool Success, string Message, IEnumerable<BranchReadDto>? Data)> GetAllActiveAsync()
        {
            try
            {
                var branches = await _branchRepository.GetActiveBranchesAsync();
                if (branches == null || !branches.Any())
                    return (false, "No active branches found", null);

                var mapped = _mapper.Map<IEnumerable<BranchReadDto>>(branches);
                return (true, "Active branches retrieved", mapped);
            }
            catch (Exception ex)
            {
                return (false, $"Error: {ex.Message}", null);
            }
        }

        public async Task<(bool Success, string Message, object? Data)> GetByIdAsync(int branchId)
        {
            try
            {
                var branch = await _branchRepository.GetByIdAsync(branchId);
                if (branch == null)
                    return (false, "Branch not found", null);

                var mapped = _mapper.Map<BranchDetailDto>(branch);
                return (true, "Branch details retrieved", mapped);
            }
            catch (Exception ex)
            {
                return (false, $"Error: {ex.Message}", null);
            }
        }

        public async Task<(bool Success, string Message, IEnumerable<AccountReadDto>? Data)> GetBranchAccountsAsync(int branchId)
        {
            try
            {
                var accounts = await _accountRepository.GetAccountsByBranchIdAsync(branchId);
                if (accounts == null || !accounts.Any())
                    return (false, "No accounts found for this branch", null);

                var mapped = _mapper.Map<IEnumerable<AccountReadDto>>(accounts);
                return (true, "Branch accounts retrieved", mapped);
            }
            catch (Exception ex)
            {
                return (false, $"Error: {ex.Message}", null);
            }
        }

        public async Task<(bool Success, string Message)> UpdateAsync(int branchId, UpdateBranchDto dto)
        {
            try
            {
                var branch = await _branchRepository.GetByIdAsync(branchId);
                if (branch == null)
                    return (false, "Branch not found");

                // Update fields manually to ensure all are handled
                if (!string.IsNullOrEmpty(dto.BranchName)) branch.BranchName = dto.BranchName;
                if (!string.IsNullOrEmpty(dto.BranchCode)) branch.BranchCode = dto.BranchCode;
                if (!string.IsNullOrEmpty(dto.Address)) branch.Address = dto.Address;
                if (!string.IsNullOrEmpty(dto.City)) branch.City = dto.City;
                if (!string.IsNullOrEmpty(dto.State)) branch.State = dto.State;
                if (!string.IsNullOrEmpty(dto.IFSCCode)) branch.IFSCCode = dto.IFSCCode;
                if (!string.IsNullOrEmpty(dto.PhoneNumber)) branch.PhoneNumber = dto.PhoneNumber;
                if (!string.IsNullOrEmpty(dto.Email)) branch.Email = dto.Email;
                if (!string.IsNullOrEmpty(dto.PostalCode)) branch.PostalCode = dto.PostalCode;
                if (dto.BranchType.HasValue) branch.BranchType = dto.BranchType.Value;
                if (dto.IsActive.HasValue) branch.IsActive = dto.IsActive.Value;
                if (dto.IsMainBranch.HasValue) branch.IsMainBranch = dto.IsMainBranch.Value;
                
                branch.UpdatedAt = DateTime.UtcNow;

                _branchRepository.Update(branch);
                await _branchRepository.SaveChangesAsync();

                return (true, "Branch updated successfully");
            }
            catch (Exception ex)
            {
                return (false, $"Error: {ex.Message}");
            }
        }

        public async Task<(bool Success, string Message, IEnumerable<BranchReadDto>? Data)> GetBranchesByTypeAsync(int branchType)
        {
            try
            {
                var branches = await _branchRepository.GetActiveBranchesAsync();
                var filtered = branches.Where(b => (int)b.BranchType == branchType);
                
                if (!filtered.Any())
                    return (false, "No branches found for this type", null);

                var mapped = _mapper.Map<IEnumerable<BranchReadDto>>(filtered);
                return (true, "Branches retrieved by type", mapped);
            }
            catch (Exception ex)
            {
                return (false, $"Error: {ex.Message}", null);
            }
        }

        public async Task<bool> HasBranchManagerAsync(int branchId)
        {
            try
            {
                return await _userRepository.HasBranchManagerAsync(branchId);
            }
            catch
            {
                return false;
            }
        }

        public async Task<BranchDetailDto?> GetBranchDetailAsync(int id)
        {
            try
            {
                var branch = await _branchRepository.GetByIdAsync(id);
                if (branch == null) return null;

                var branchDetail = _mapper.Map<BranchDetailDto>(branch);

                // Get branch manager
                var branchManager = await _userRepository.GetBranchManagerByBranchIdAsync(id);
                if (branchManager != null)
                {
                    branchDetail.BranchManager = _mapper.Map<BranchManagerDto>(branchManager);
                }

                // Get branch statistics
                var accounts = await _accountRepository.GetAccountsByBranchIdAsync(id);
                var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);

                branchDetail.Statistics = new BranchStatisticsDto
                {
                    TotalAccounts = accounts.Count(),
                    ActiveAccounts = accounts.Count(a => a.Status == AccountStatus.Active),
                    PendingAccounts = accounts.Count(a => a.Status == AccountStatus.Pending),
                    TotalDeposits = accounts.Sum(a => a.Balance),
                    TotalCustomers = accounts.Select(a => a.UserId).Distinct().Count()
                };

                return branchDetail;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
    }
}
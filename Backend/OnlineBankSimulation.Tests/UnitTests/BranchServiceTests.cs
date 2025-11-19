using Xunit;
using Moq;
using AutoMapper;
using Microsoft.Extensions.Logging;
using OnlineBankSimulation.Application.Services;
using OnlineBank.Core.Repositories;
using OnlineBank.Core.Models;
using OnlineBank.Core.DTOs.BranchDtos;
using OnlineBank.Core.DTOs.AccountDtos;
using OnlineBank.Core.Enums;
using OnlineBank.Core.Repository;

namespace OnlineBankSimulation.Tests.UnitTests
{
    public class BranchServiceTests
    {
        private readonly Mock<IBranchRepository> _mockBranchRepository;
        private readonly Mock<IAccountRepository> _mockAccountRepository;
        private readonly Mock<IUserRepository> _mockUserRepository;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<ILogger<BranchService>> _mockLogger;
        private readonly BranchService _branchService;

        public BranchServiceTests()
        {
            _mockBranchRepository = new Mock<IBranchRepository>();
            _mockAccountRepository = new Mock<IAccountRepository>();
            _mockUserRepository = new Mock<IUserRepository>();
            _mockMapper = new Mock<IMapper>();
            _mockLogger = new Mock<ILogger<BranchService>>();

            _branchService = new BranchService(
                _mockBranchRepository.Object,
                _mockAccountRepository.Object,
                _mockUserRepository.Object,
                _mockMapper.Object,
                _mockLogger.Object
            );
        }

        [Fact]
        public async Task GetAllAsync_ReturnsBranches()
        {
            // Arrange
            var branches = new List<Branch>
            {
                new Branch { Id = 1, BranchName = "Main Branch", IsActive = true },
                new Branch { Id = 2, BranchName = "Secondary Branch", IsActive = true }
            };

            var branchDtos = new List<BranchReadDto>
            {
                new BranchReadDto { Id = 1, Name = "Main Branch" },
                new BranchReadDto { Id = 2, Name = "Secondary Branch" }
            };

            _mockBranchRepository.Setup(x => x.GetActiveBranchesAsync())
                .ReturnsAsync(branches);
            _mockMapper.Setup(x => x.Map<IEnumerable<BranchReadDto>>(branches))
                .Returns(branchDtos);

            // Act
            var result = await _branchService.GetAllAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Equal("Main Branch", result.First().Name);
        }

        [Fact]
        public async Task CreateAsync_ValidBranch_CreatesSuccessfully()
        {
            // Arrange
            var dto = new CreateBranchDto
            {
                BranchName = "New Branch",
                BranchCode = "NB001",
                Address = "123 Main St",
                City = "Test City",
                State = "Test State",
                IFSCCode = "TEST0001234"
            };

            var existingBranches = new List<Branch>();
            var newBranch = new Branch
            {
                BranchName = dto.BranchName,
                BranchCode = dto.BranchCode
            };

            _mockBranchRepository.Setup(x => x.GetAllAsync())
                .ReturnsAsync(existingBranches);
            _mockMapper.Setup(x => x.Map<Branch>(dto))
                .Returns(newBranch);
            _mockBranchRepository.Setup(x => x.AddAsync(It.IsAny<Branch>()))
                .Returns(Task.CompletedTask);
            _mockBranchRepository.Setup(x => x.SaveChangesAsync())
                .Returns(Task.CompletedTask);

            // Act
            var result = await _branchService.CreateAsync(dto);

            // Assert
            Assert.True(result.Success);
            Assert.Equal("Branch created successfully", result.Message);
            _mockBranchRepository.Verify(x => x.AddAsync(It.IsAny<Branch>()), Times.Once);
        }

        [Fact]
        public async Task CreateAsync_DuplicateBranchCode_ReturnsFalse()
        {
            // Arrange
            var dto = new CreateBranchDto
            {
                BranchName = "New Branch",
                BranchCode = "EXISTING001"
            };

            var existingBranches = new List<Branch>
            {
                new Branch { Id = 1, BranchCode = "EXISTING001" }
            };

            _mockBranchRepository.Setup(x => x.GetAllAsync())
                .ReturnsAsync(existingBranches);

            // Act
            var result = await _branchService.CreateAsync(dto);

            // Assert
            Assert.False(result.Success);
            Assert.Equal("Branch code already exists", result.Message);
            _mockBranchRepository.Verify(x => x.AddAsync(It.IsAny<Branch>()), Times.Never);
        }

        [Fact]
        public async Task GetAllActiveAsync_HasActiveBranches_ReturnsSuccess()
        {
            // Arrange
            var branches = new List<Branch>
            {
                new Branch { Id = 1, BranchName = "Active Branch 1", IsActive = true },
                new Branch { Id = 2, BranchName = "Active Branch 2", IsActive = true }
            };

            var branchDtos = new List<BranchReadDto>
            {
                new BranchReadDto { Id = 1, Name = "Active Branch 1" },
                new BranchReadDto { Id = 2, Name = "Active Branch 2" }
            };

            _mockBranchRepository.Setup(x => x.GetActiveBranchesAsync())
                .ReturnsAsync(branches);
            _mockMapper.Setup(x => x.Map<IEnumerable<BranchReadDto>>(branches))
                .Returns(branchDtos);

            // Act
            var result = await _branchService.GetAllActiveAsync();

            // Assert
            Assert.True(result.Success);
            Assert.Equal("Active branches retrieved", result.Message);
            Assert.NotNull(result.Data);
            Assert.Equal(2, result.Data.Count());
        }

        [Fact]
        public async Task GetAllActiveAsync_NoActiveBranches_ReturnsFalse()
        {
            // Arrange
            var branches = new List<Branch>();

            _mockBranchRepository.Setup(x => x.GetActiveBranchesAsync())
                .ReturnsAsync(branches);

            // Act
            var result = await _branchService.GetAllActiveAsync();

            // Assert
            Assert.False(result.Success);
            Assert.Equal("No active branches found", result.Message);
            Assert.Null(result.Data);
        }

        [Fact]
        public async Task GetByIdAsync_ValidId_ReturnsBranchDetail()
        {
            // Arrange
            var branchId = 1;
            var branch = new Branch
            {
                Id = branchId,
                BranchName = "Test Branch",
                BranchCode = "TB001"
            };

            var branchDetailDto = new BranchDetailDto
            {
                Id = branchId,
                BranchName = "Test Branch",
                BranchCode = "TB001"
            };

            _mockBranchRepository.Setup(x => x.GetByIdAsync(branchId))
                .ReturnsAsync(branch);
            _mockMapper.Setup(x => x.Map<BranchDetailDto>(branch))
                .Returns(branchDetailDto);

            // Act
            var result = await _branchService.GetByIdAsync(branchId);

            // Assert
            Assert.True(result.Success);
            Assert.Equal("Branch details retrieved", result.Message);
            Assert.NotNull(result.Data);
        }

        [Fact]
        public async Task GetByIdAsync_InvalidId_ReturnsFalse()
        {
            // Arrange
            var branchId = 999;
            _mockBranchRepository.Setup(x => x.GetByIdAsync(branchId))
                .ReturnsAsync((Branch?)null);

            // Act
            var result = await _branchService.GetByIdAsync(branchId);

            // Assert
            Assert.False(result.Success);
            Assert.Equal("Branch not found", result.Message);
            Assert.Null(result.Data);
        }

        [Fact]
        public async Task GetBranchAccountsAsync_HasAccounts_ReturnsAccounts()
        {
            // Arrange
            var branchId = 1;
            var accounts = new List<Account>
            {
                new Account { Id = 1, BranchId = branchId, AccountNumber = "ACC001" },
                new Account { Id = 2, BranchId = branchId, AccountNumber = "ACC002" }
            };

            var accountDtos = new List<AccountReadDto>
            {
                new AccountReadDto { Id = 1, AccountNumber = "ACC001" },
                new AccountReadDto { Id = 2, AccountNumber = "ACC002" }
            };

            _mockAccountRepository.Setup(x => x.GetAccountsByBranchIdAsync(branchId))
                .ReturnsAsync(accounts);
            _mockMapper.Setup(x => x.Map<IEnumerable<AccountReadDto>>(accounts))
                .Returns(accountDtos);

            // Act
            var result = await _branchService.GetBranchAccountsAsync(branchId);

            // Assert
            Assert.True(result.Success);
            Assert.Equal("Branch accounts retrieved", result.Message);
            Assert.NotNull(result.Data);
            Assert.Equal(2, result.Data.Count());
        }

        [Fact]
        public async Task UpdateAsync_ValidBranch_UpdatesSuccessfully()
        {
            // Arrange
            var branchId = 1;
            var dto = new UpdateBranchDto
            {
                BranchName = "Updated Branch Name",
                Address = "Updated Address",
                IsActive = true
            };

            var branch = new Branch
            {
                Id = branchId,
                BranchName = "Original Name",
                Address = "Original Address"
            };

            _mockBranchRepository.Setup(x => x.GetByIdAsync(branchId))
                .ReturnsAsync(branch);
            _mockBranchRepository.Setup(x => x.SaveChangesAsync())
                .Returns(Task.CompletedTask);

            // Act
            var result = await _branchService.UpdateAsync(branchId, dto);

            // Assert
            Assert.True(result.Success);
            Assert.Equal("Branch updated successfully", result.Message);
            Assert.Equal("Updated Branch Name", branch.BranchName);
            Assert.Equal("Updated Address", branch.Address);
            _mockBranchRepository.Verify(x => x.Update(branch), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_InvalidBranch_ReturnsFalse()
        {
            // Arrange
            var branchId = 999;
            var dto = new UpdateBranchDto { BranchName = "Updated Name" };

            _mockBranchRepository.Setup(x => x.GetByIdAsync(branchId))
                .ReturnsAsync((Branch?)null);

            // Act
            var result = await _branchService.UpdateAsync(branchId, dto);

            // Assert
            Assert.False(result.Success);
            Assert.Equal("Branch not found", result.Message);
            _mockBranchRepository.Verify(x => x.Update(It.IsAny<Branch>()), Times.Never);
        }

        [Fact]
        public async Task GetBranchesByTypeAsync_ValidType_ReturnsBranches()
        {
            // Arrange
            var branchType = (int)BranchType.Main;
            var branches = new List<Branch>
            {
                new Branch { Id = 1, BranchType = BranchType.Main, IsActive = true },
                new Branch { Id = 2, BranchType = BranchType.Sub, IsActive = true },
                new Branch { Id = 3, BranchType = BranchType.Main, IsActive = true }
            };

            var expectedDtos = new List<BranchReadDto>
            {
                new BranchReadDto { Id = 1, Name = "Main Branch 1" },
                new BranchReadDto { Id = 3, Name = "Main Branch 2" }
            };

            _mockBranchRepository.Setup(x => x.GetActiveBranchesAsync())
                .ReturnsAsync(branches);
            _mockMapper.Setup(x => x.Map<IEnumerable<BranchReadDto>>(It.IsAny<IEnumerable<Branch>>()))
                .Returns(expectedDtos);

            // Act
            var result = await _branchService.GetBranchesByTypeAsync(branchType);

            // Assert
            Assert.True(result.Success);
            Assert.Equal("Branches retrieved by type", result.Message);
            Assert.NotNull(result.Data);
            Assert.Equal(2, result.Data.Count());
        }

        [Fact]
        public async Task HasBranchManagerAsync_ValidBranch_ReturnsTrue()
        {
            // Arrange
            var branchId = 1;
            _mockUserRepository.Setup(x => x.HasBranchManagerAsync(branchId))
                .ReturnsAsync(true);

            // Act
            var result = await _branchService.HasBranchManagerAsync(branchId);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task HasBranchManagerAsync_NoBranchManager_ReturnsFalse()
        {
            // Arrange
            var branchId = 1;
            _mockUserRepository.Setup(x => x.HasBranchManagerAsync(branchId))
                .ReturnsAsync(false);

            // Act
            var result = await _branchService.HasBranchManagerAsync(branchId);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task GetBranchDetailAsync_ValidBranch_ReturnsDetailWithStatistics()
        {
            // Arrange
            var branchId = 1;
            var branch = new Branch
            {
                Id = branchId,
                BranchName = "Test Branch"
            };

            var branchManager = new User
            {
                Id = 1,
                FullName = "Branch Manager",
                Role = UserRole.BranchManager,
                Email = "manager@test.com",
                PhoneNumber = "1234567890",
                PasswordHash = "hashedpassword"
            };

            var accounts = new List<Account>
            {
                new Account { Id = 1, Status = AccountStatus.Active, Balance = 1000, UserId = 1 },
                new Account { Id = 2, Status = AccountStatus.Pending, Balance = 2000, UserId = 2 },
                new Account { Id = 3, Status = AccountStatus.Active, Balance = 3000, UserId = 1 }
            };

            var branchDetailDto = new BranchDetailDto
            {
                Id = branchId,
                BranchName = "Test Branch"
            };

            var branchManagerDto = new BranchManagerDto
            {
                Id = 1,
                FullName = "Branch Manager"
            };

            _mockBranchRepository.Setup(x => x.GetByIdAsync(branchId))
                .ReturnsAsync(branch);
            _mockUserRepository.Setup(x => x.GetBranchManagerByBranchIdAsync(branchId))
                .ReturnsAsync(branchManager);
            _mockAccountRepository.Setup(x => x.GetAccountsByBranchIdAsync(branchId))
                .ReturnsAsync(accounts);
            _mockMapper.Setup(x => x.Map<BranchDetailDto>(branch))
                .Returns(branchDetailDto);
            _mockMapper.Setup(x => x.Map<BranchManagerDto>(branchManager))
                .Returns(branchManagerDto);

            // Act
            var result = await _branchService.GetBranchDetailAsync(branchId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(branchId, result.Id);
            Assert.NotNull(result.BranchManager);
            Assert.Equal("Branch Manager", result.BranchManager.FullName);
            Assert.NotNull(result.Statistics);
            Assert.Equal(3, result.Statistics.TotalAccounts);
            Assert.Equal(2, result.Statistics.ActiveAccounts);
            Assert.Equal(1, result.Statistics.PendingAccounts);
            Assert.Equal(6000, result.Statistics.TotalDeposits);
            Assert.Equal(2, result.Statistics.TotalCustomers);
        }
    }
}
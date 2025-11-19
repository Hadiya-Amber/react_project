using Xunit;
using Moq;
using AutoMapper;
using Microsoft.Extensions.Logging;
using OnlineBankSimulation.Application.Services;
using OnlineBank.Core.Repository;
using OnlineBank.Core.Repositories;
using OnlineBank.Core.Models;
using OnlineBank.Core.DTOs.AccountDtos;
using OnlineBank.Core.Enums;
using OnlineBankSimulation.Application.Interfaces;
using FluentValidation;
using FluentValidation.Results;

namespace OnlineBankSimulation.Tests.UnitTests
{
    public class AccountServiceTests
    {
        private readonly Mock<IAccountRepository> _mockAccountRepository;
        private readonly Mock<IUserRepository> _mockUserRepository;
        private readonly Mock<IBranchRepository> _mockBranchRepository;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<ILogger<AccountService>> _mockLogger;
        private readonly Mock<IValidator<AccountCreateDto>> _mockValidator;
        private readonly AccountService _accountService;

        public AccountServiceTests()
        {
            _mockAccountRepository = new Mock<IAccountRepository>();
            _mockUserRepository = new Mock<IUserRepository>();
            _mockBranchRepository = new Mock<IBranchRepository>();
            _mockMapper = new Mock<IMapper>();
            _mockLogger = new Mock<ILogger<AccountService>>();
            _mockValidator = new Mock<IValidator<AccountCreateDto>>();

            _mockValidator.Setup(x => x.ValidateAsync(It.IsAny<AccountCreateDto>(), default))
                .ReturnsAsync(new ValidationResult());

            _accountService = new AccountService(
                _mockAccountRepository.Object,
                _mockUserRepository.Object,
                _mockBranchRepository.Object,
                _mockMapper.Object,
                _mockLogger.Object,
                _mockValidator.Object
            );
        }

        [Fact]
        public async Task GetByIdAsync_ValidId_ReturnsAccountDto()
        {
            // Arrange
            var accountId = 1;
            var account = new Account { Id = accountId, AccountNumber = "ACC123", Balance = 1000 };
            var accountDto = new AccountReadDto { Id = accountId, AccountNumber = "ACC123", Balance = 1000 };

            _mockAccountRepository.Setup(x => x.GetByIdAsync(accountId))
                .ReturnsAsync(account);
            _mockMapper.Setup(x => x.Map<AccountReadDto>(account))
                .Returns(accountDto);

            // Act
            var result = await _accountService.GetByIdAsync(accountId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(accountId, result.Id);
            Assert.Equal("ACC123", result.AccountNumber);
        }

        [Fact]
        public async Task GetByIdAsync_InvalidId_ReturnsNull()
        {
            // Arrange
            var accountId = 999;
            _mockAccountRepository.Setup(x => x.GetByIdAsync(accountId))
                .ReturnsAsync((Account?)null);

            // Act
            var result = await _accountService.GetByIdAsync(accountId);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateAsync_ValidUser_CreatesAccount()
        {
            // Arrange
            var userId = 1;
            var dto = new AccountCreateDto { BranchId = 1, AccountType = AccountType.Savings, InitialDeposit = 1000 };
            var user = new User { Id = userId, FullName = "Test User", Email = "test@test.com", PhoneNumber = "1234567890", PasswordHash = "hashedpassword" };
            var account = new Account { Id = 1, UserId = userId, Balance = 1000 };
            var accountDto = new AccountReadDto { Id = 1, UserId = userId, Balance = 1000 };

            _mockUserRepository.Setup(x => x.GetUserByIdAsync(userId))
                .ReturnsAsync(user);
            _mockAccountRepository.Setup(x => x.AddAsync(It.IsAny<Account>()))
                .Returns(Task.CompletedTask);
            _mockAccountRepository.Setup(x => x.SaveChangesAsync())
                .Returns(Task.CompletedTask);
            _mockMapper.Setup(x => x.Map<Account>(dto))
                .Returns(account);
            _mockMapper.Setup(x => x.Map<AccountReadDto>(It.IsAny<Account>()))
                .Returns(accountDto);
            _mockBranchRepository.Setup(x => x.GetByIdAsync(dto.BranchId))
                .ReturnsAsync(new Branch { Id = dto.BranchId, BranchCode = "001" });

            // Act
            var result = await _accountService.CreateAsync(dto, userId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(userId, result.UserId);
            _mockAccountRepository.Verify(x => x.AddAsync(It.IsAny<Account>()), Times.Once);
            _mockAccountRepository.Verify(x => x.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task CreateAsync_InvalidUser_ReturnsNull()
        {
            // Arrange
            var userId = 999;
            var dto = new AccountCreateDto { BranchId = 1, AccountType = AccountType.Savings, InitialDeposit = 1000 };

            _mockUserRepository.Setup(x => x.GetUserByIdAsync(userId))
                .ReturnsAsync((User?)null);

            // Act
            var result = await _accountService.CreateAsync(dto, userId);

            // Assert
            Assert.NotNull(result);
            _mockAccountRepository.Verify(x => x.AddAsync(It.IsAny<Account>()), Times.Never);
        }

        [Fact]
        public async Task ApproveAccountAsync_ValidAccount_ApprovesSuccessfully()
        {
            // Arrange
            var accountId = 1;
            var account = new Account { Id = accountId, Status = AccountStatus.Pending };

            _mockAccountRepository.Setup(x => x.GetByIdAsync(accountId))
                .ReturnsAsync(account);
            _mockAccountRepository.Setup(x => x.UpdateAsync(It.IsAny<Account>()))
                .Returns(Task.CompletedTask);
            _mockAccountRepository.Setup(x => x.SaveChangesAsync())
                .Returns(Task.CompletedTask);

            // Act
            var result = await _accountService.ApproveAccountAsync(accountId);

            // Assert
            Assert.True(result);
            Assert.Equal(AccountStatus.Active, account.Status);
            _mockAccountRepository.Verify(x => x.UpdateAsync(account), Times.Once);
            _mockAccountRepository.Verify(x => x.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task VerifyAccountAsync_ValidAccount_VerifiesSuccessfully()
        {
            // Arrange
            var accountId = 1;
            var verifiedBy = 2;
            var dto = new VerifyAccountDto { IsApproved = true };
            var account = new Account { Id = accountId, Status = AccountStatus.Pending };

            _mockAccountRepository.Setup(x => x.GetByIdAsync(accountId))
                .ReturnsAsync(account);
            _mockAccountRepository.Setup(x => x.UpdateAsync(It.IsAny<Account>()))
                .Returns(Task.CompletedTask);
            _mockAccountRepository.Setup(x => x.SaveChangesAsync())
                .Returns(Task.CompletedTask);

            // Act
            var result = await _accountService.VerifyAccountAsync(accountId, dto, verifiedBy);

            // Assert
            Assert.True(result);
            Assert.Equal(AccountStatus.Active, account.Status);
        }

        [Fact]
        public async Task VerifyAccountAsync_AccountNotFound_ReturnsFalse()
        {
            // Arrange
            var accountId = 999;
            var verifiedBy = 2;
            var dto = new VerifyAccountDto { IsApproved = true };

            _mockAccountRepository.Setup(x => x.GetByIdAsync(accountId))
                .ReturnsAsync((Account?)null);

            // Act
            var result = await _accountService.VerifyAccountAsync(accountId, dto, verifiedBy);

            // Assert
            Assert.False(result);
            _mockAccountRepository.Verify(x => x.UpdateAsync(It.IsAny<Account>()), Times.Never);
        }

        [Fact]
        public async Task GetPendingAccountsAsync_ReturnsPendingAccounts()
        {
            // Arrange
            var accounts = new List<Account>
            {
                new Account { Id = 1, Status = AccountStatus.Pending },
                new Account { Id = 2, Status = AccountStatus.Active },
                new Account { Id = 3, Status = AccountStatus.Pending }
            };
            var expectedDtos = new List<AccountReadDto>
            {
                new AccountReadDto { Id = 1, Status = AccountStatus.Pending },
                new AccountReadDto { Id = 3, Status = AccountStatus.Pending }
            };

            _mockAccountRepository.Setup(x => x.GetPendingAccountsAsync())
                .ReturnsAsync(accounts.Where(a => a.Status == AccountStatus.Pending));
            _mockMapper.Setup(x => x.Map<IEnumerable<AccountReadDto>>(It.IsAny<IEnumerable<Account>>()))
                .Returns(expectedDtos);

            // Act
            var result = await _accountService.GetPendingAccountsAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task DeleteAsync_ValidAccount_SoftDeletesAccount()
        {
            // Arrange
            var accountId = 1;
            var account = new Account { Id = accountId, IsDeleted = false };

            _mockAccountRepository.Setup(x => x.GetByIdAsync(accountId))
                .ReturnsAsync(account);
            _mockAccountRepository.Setup(x => x.UpdateAsync(It.IsAny<Account>()))
                .Returns(Task.CompletedTask);
            _mockAccountRepository.Setup(x => x.SaveChangesAsync())
                .Returns(Task.CompletedTask);

            // Act
            var result = await _accountService.DeleteAsync(accountId);

            // Assert
            Assert.True(result);
            Assert.True(account.IsDeleted);
            _mockAccountRepository.Verify(x => x.UpdateAsync(account), Times.Once);
        }
    }
}
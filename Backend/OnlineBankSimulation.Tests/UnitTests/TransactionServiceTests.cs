using Xunit;
using Moq;
using AutoMapper;
using Microsoft.Extensions.Logging;
using OnlineBank.Core.Services;
using OnlineBank.Core.Repository;
using OnlineBank.Core.Repositories;
using OnlineBank.Core.Models;
using OnlineBank.Core.DTOs.TransactionDtos;
using OnlineBank.Core.Enums;
using OnlineBank.Core.Interfaces;
using OnlineBankSimulation.Application.Services;

namespace OnlineBankSimulation.Tests.UnitTests
{
    public class TransactionServiceTests
    {
        private readonly Mock<ITransactionRepository> _mockTransactionRepository;
        private readonly Mock<IAccountRepository> _mockAccountRepository;
        private readonly Mock<IUserRepository> _mockUserRepository;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<IPdfGenerator> _mockPdfGenerator;
        private readonly Mock<ILogger<TransactionService>> _mockLogger;
        private readonly Mock<IBusinessRulesEngine> _mockBusinessRules;
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly Mock<IAccountTypeBusinessRulesService> _mockAccountTypeRules;
        private readonly TransactionService _transactionService;

        public TransactionServiceTests()
        {
            _mockTransactionRepository = new Mock<ITransactionRepository>();
            _mockAccountRepository = new Mock<IAccountRepository>();
            _mockUserRepository = new Mock<IUserRepository>();
            _mockMapper = new Mock<IMapper>();
            _mockPdfGenerator = new Mock<IPdfGenerator>();
            _mockLogger = new Mock<ILogger<TransactionService>>();
            _mockBusinessRules = new Mock<IBusinessRulesEngine>();
            _mockEmailService = new Mock<IEmailService>();
            _mockAccountTypeRules = new Mock<IAccountTypeBusinessRulesService>();

            _transactionService = new TransactionService(
                _mockTransactionRepository.Object,
                _mockAccountRepository.Object,
                _mockUserRepository.Object,
                _mockMapper.Object,
                _mockPdfGenerator.Object,
                _mockLogger.Object,
                _mockBusinessRules.Object,
                _mockEmailService.Object,
                _mockAccountTypeRules.Object
            );
        }

        [Fact]
        public async Task ProcessDepositAsync_ValidDeposit_CompletesSuccessfully()
        {
            // Arrange
            var dto = new DepositDto
            {
                ToAccountNumber = "ACC123",
                Amount = 1000,
                DepositMode = DepositMode.Cash,
                Description = "Test deposit"
            };

            var account = new Account
            {
                Id = 1,
                AccountNumber = "ACC123",
                Balance = 5000,
                Status = AccountStatus.Active,
                UserId = 1
            };

            var user = new User
            {
                Id = 1,
                FullName = "Test User",
                Email = "test@test.com",
                PhoneNumber = "1234567890",
                PasswordHash = "hashedpassword"
            };

            _mockAccountRepository.Setup(x => x.GetByAccountNumberAsync("ACC123"))
                .ReturnsAsync(account);
            _mockUserRepository.Setup(x => x.GetByIdAsync(1))
                .ReturnsAsync(user);
            _mockTransactionRepository.Setup(x => x.AddTransactionAsync(It.IsAny<Transaction>()))
                .Returns(Task.CompletedTask);
            _mockAccountRepository.Setup(x => x.UpdateAsync(It.IsAny<Account>()))
                .Returns(Task.CompletedTask);
            _mockTransactionRepository.Setup(x => x.SaveAsync())
                .Returns(Task.CompletedTask);
            _mockEmailService.Setup(x => x.SendWelcomeEmailAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(true);

            // Act
            var result = await _transactionService.ProcessDepositAsync(dto);

            // Assert
            Assert.True(result.Success);
            Assert.Equal("Deposit completed successfully", result.Message);
            Assert.Equal(6000, account.Balance);
            _mockTransactionRepository.Verify(x => x.AddTransactionAsync(It.IsAny<Transaction>()), Times.Once);
            _mockEmailService.Verify(x => x.SendWelcomeEmailAsync(user.Email, It.IsAny<string>()), Times.Once);
        }

        [Fact]
        public async Task ProcessDepositAsync_AccountNotFound_ReturnsFalse()
        {
            // Arrange
            var dto = new DepositDto
            {
                ToAccountNumber = "INVALID",
                Amount = 1000,
                DepositMode = DepositMode.Cash
            };

            _mockAccountRepository.Setup(x => x.GetByAccountNumberAsync("INVALID"))
                .ReturnsAsync((Account?)null);

            // Act
            var result = await _transactionService.ProcessDepositAsync(dto);

            // Assert
            Assert.False(result.Success);
            Assert.Equal("Account not found", result.Message);
            _mockTransactionRepository.Verify(x => x.AddTransactionAsync(It.IsAny<Transaction>()), Times.Never);
        }

        [Fact]
        public async Task ProcessDepositAsync_InactiveAccount_ReturnsFalse()
        {
            // Arrange
            var dto = new DepositDto
            {
                ToAccountNumber = "ACC123",
                Amount = 1000,
                DepositMode = DepositMode.Cash
            };

            var account = new Account
            {
                Id = 1,
                AccountNumber = "ACC123",
                Status = AccountStatus.Dormant
            };

            _mockAccountRepository.Setup(x => x.GetByAccountNumberAsync("ACC123"))
                .ReturnsAsync(account);

            // Act
            var result = await _transactionService.ProcessDepositAsync(dto);

            // Assert
            Assert.False(result.Success);
            Assert.Equal("Account is not active", result.Message);
        }

        [Fact]
        public async Task ProcessWithdrawalAsync_ValidWithdrawal_CompletesSuccessfully()
        {
            // Arrange
            var dto = new WithdrawalDto
            {
                FromAccountNumber = "ACC123",
                Amount = 1000,
                WithdrawalMode = WithdrawalMode.BankCounter,
                Description = "ATM withdrawal"
            };

            var account = new Account
            {
                Id = 1,
                AccountNumber = "ACC123",
                Balance = 5000,
                Status = AccountStatus.Active,
                UserId = 1
            };

            var user = new User
            {
                Id = 1,
                FullName = "Test User",
                Email = "test@test.com",
                PhoneNumber = "1234567890",
                PasswordHash = "hashedpassword"
            };

            _mockAccountRepository.Setup(x => x.GetByAccountNumberAsync("ACC123"))
                .ReturnsAsync(account);
            _mockUserRepository.Setup(x => x.GetByIdAsync(1))
                .ReturnsAsync(user);
            _mockTransactionRepository.Setup(x => x.AddTransactionAsync(It.IsAny<Transaction>()))
                .Returns(Task.CompletedTask);
            _mockAccountRepository.Setup(x => x.UpdateAsync(It.IsAny<Account>()))
                .Returns(Task.CompletedTask);
            _mockTransactionRepository.Setup(x => x.SaveAsync())
                .Returns(Task.CompletedTask);
            _mockEmailService.Setup(x => x.SendWelcomeEmailAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(true);

            // Act
            var result = await _transactionService.ProcessWithdrawalAsync(dto);

            // Assert
            Assert.True(result.Success);
            Assert.Equal("Withdrawal completed successfully", result.Message);
            Assert.Equal(4000, account.Balance);
            _mockTransactionRepository.Verify(x => x.AddTransactionAsync(It.IsAny<Transaction>()), Times.Once);
        }

        [Fact]
        public async Task ProcessWithdrawalAsync_InsufficientBalance_ReturnsFalse()
        {
            // Arrange
            var dto = new WithdrawalDto
            {
                FromAccountNumber = "ACC123",
                Amount = 6000,
                WithdrawalMode = WithdrawalMode.BankCounter
            };

            var account = new Account
            {
                Id = 1,
                AccountNumber = "ACC123",
                Balance = 5000,
                Status = AccountStatus.Active
            };

            _mockAccountRepository.Setup(x => x.GetByAccountNumberAsync("ACC123"))
                .ReturnsAsync(account);

            // Act
            var result = await _transactionService.ProcessWithdrawalAsync(dto);

            // Assert
            Assert.False(result.Success);
            Assert.Equal("Insufficient balance", result.Message);
            _mockTransactionRepository.Verify(x => x.AddTransactionAsync(It.IsAny<Transaction>()), Times.Never);
        }

        [Fact]
        public async Task ProcessTransferAsync_ValidTransfer_CompletesSuccessfully()
        {
            // Arrange
            var dto = new TransferDto
            {
                FromAccountNumber = "ACC123",
                ToAccountNumber = "ACC456",
                Amount = 1000,
                Description = "Test transfer"
            };

            var fromAccount = new Account
            {
                Id = 1,
                AccountNumber = "ACC123",
                Balance = 5000,
                Status = AccountStatus.Active,
                UserId = 1
            };

            var toAccount = new Account
            {
                Id = 2,
                AccountNumber = "ACC456",
                Balance = 2000,
                Status = AccountStatus.Active,
                UserId = 2
            };

            var fromUser = new User { Id = 1, FullName = "Sender", Email = "sender@test.com", PhoneNumber = "1234567890", PasswordHash = "hashedpassword" };
            var toUser = new User { Id = 2, FullName = "Receiver", Email = "receiver@test.com", PhoneNumber = "0987654321", PasswordHash = "hashedpassword" };

            _mockAccountRepository.Setup(x => x.GetByAccountNumberAsync("ACC123"))
                .ReturnsAsync(fromAccount);
            _mockAccountRepository.Setup(x => x.GetByAccountNumberAsync("ACC456"))
                .ReturnsAsync(toAccount);
            _mockUserRepository.Setup(x => x.GetByIdAsync(1))
                .ReturnsAsync(fromUser);
            _mockUserRepository.Setup(x => x.GetByIdAsync(2))
                .ReturnsAsync(toUser);
            _mockTransactionRepository.Setup(x => x.AddTransactionAsync(It.IsAny<Transaction>()))
                .Returns(Task.CompletedTask);
            _mockAccountRepository.Setup(x => x.UpdateAsync(It.IsAny<Account>()))
                .Returns(Task.CompletedTask);
            _mockTransactionRepository.Setup(x => x.UpdateAsync(It.IsAny<Transaction>()))
                .Returns(Task.CompletedTask);
            _mockTransactionRepository.Setup(x => x.SaveAsync())
                .Returns(Task.CompletedTask);
            _mockEmailService.Setup(x => x.SendWelcomeEmailAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(true);

            // Act
            var result = await _transactionService.ProcessTransferAsync(dto);

            // Assert
            Assert.True(result.Success);
            Assert.Equal("Transfer completed successfully", result.Message);
            Assert.Equal(4000, fromAccount.Balance);
            Assert.Equal(3000, toAccount.Balance);
            _mockEmailService.Verify(x => x.SendWelcomeEmailAsync(It.IsAny<string>(), It.IsAny<string>()), Times.Exactly(2));
        }

        [Fact]
        public async Task ProcessTransferAsync_SameAccount_ReturnsFalse()
        {
            // Arrange
            var dto = new TransferDto
            {
                FromAccountNumber = "ACC123",
                ToAccountNumber = "ACC123",
                Amount = 1000
            };

            // Act
            var result = await _transactionService.ProcessTransferAsync(dto);

            // Assert
            Assert.False(result.Success);
            Assert.Equal("Cannot transfer to the same account", result.Message);
        }

        [Fact]
        public async Task GetTransactionByIdAsync_ValidId_ReturnsTransaction()
        {
            // Arrange
            var transactionId = 1;
            var transaction = new Transaction
            {
                Id = transactionId,
                Amount = 1000,
                TransactionType = TransactionType.Deposit
            };

            _mockTransactionRepository.Setup(x => x.GetTransactionByIdAsync(transactionId))
                .ReturnsAsync(transaction);

            // Act
            var result = await _transactionService.GetTransactionByIdAsync(transactionId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(transactionId, result.Id);
            Assert.Equal(1000, result.Amount);
        }

        [Fact]
        public async Task GetTransactionByIdAsync_InvalidId_ReturnsNull()
        {
            // Arrange
            var transactionId = 999;
            _mockTransactionRepository.Setup(x => x.GetTransactionByIdAsync(transactionId))
                .ReturnsAsync((Transaction?)null);

            // Act
            var result = await _transactionService.GetTransactionByIdAsync(transactionId);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task DeleteTransactionAsync_ValidTransaction_SoftDeletes()
        {
            // Arrange
            var transactionId = 1;
            var transaction = new Transaction
            {
                Id = transactionId,
                IsDeleted = false
            };

            _mockTransactionRepository.Setup(x => x.GetTransactionByIdAsync(transactionId))
                .ReturnsAsync(transaction);
            _mockTransactionRepository.Setup(x => x.UpdateAsync(It.IsAny<Transaction>()))
                .Returns(Task.CompletedTask);
            _mockTransactionRepository.Setup(x => x.SaveAsync())
                .Returns(Task.CompletedTask);

            // Act
            var result = await _transactionService.DeleteTransactionAsync(transactionId);

            // Assert
            Assert.True(result);
            Assert.True(transaction.IsDeleted);
            _mockTransactionRepository.Verify(x => x.UpdateAsync(transaction), Times.Once);
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-100)]
        public async Task ProcessDepositAsync_InvalidAmount_ReturnsFalse(decimal amount)
        {
            // Arrange
            var dto = new DepositDto
            {
                ToAccountNumber = "ACC123",
                Amount = amount,
                DepositMode = DepositMode.Cash
            };

            // Act
            var result = await _transactionService.ProcessDepositAsync(dto);

            // Assert
            Assert.False(result.Success);
            Assert.Equal("Deposit amount must be greater than zero", result.Message);
        }

        [Fact]
        public async Task ProcessDepositAsync_NullDto_ReturnsFalse()
        {
            // Act
            var result = await _transactionService.ProcessDepositAsync(null!);

            // Assert
            Assert.False(result.Success);
            Assert.Equal("Deposit data is required", result.Message);
        }
    }
}
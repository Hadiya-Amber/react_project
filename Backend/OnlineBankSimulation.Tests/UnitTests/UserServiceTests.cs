using Xunit;
using Moq;
using AutoMapper;
using Microsoft.Extensions.Logging;
using OnlineBankSimulation.Application.Services;
using OnlineBank.Core.Repository;
using OnlineBank.Core.Repositories;
using OnlineBank.Core.Models;
using OnlineBank.Core.DTOs.UserDtos;
using OnlineBank.Core.Interfaces;
using OnlineBank.Core.Enums;

namespace OnlineBankSimulation.Tests.UnitTests
{
    public class UserServiceTests
    {
        private readonly Mock<IUserRepository> _mockUserRepository;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<ILogger<UserService>> _mockLogger;
        private readonly Mock<IPasswordHasher> _mockPasswordHasher;
        private readonly UserService _userService;

        public UserServiceTests()
        {
            _mockUserRepository = new Mock<IUserRepository>();
            _mockMapper = new Mock<IMapper>();
            _mockLogger = new Mock<ILogger<UserService>>();
            _mockPasswordHasher = new Mock<IPasswordHasher>();

            _userService = new UserService(
                _mockUserRepository.Object,
                _mockMapper.Object,
                _mockLogger.Object,
                _mockPasswordHasher.Object
            );
        }

        [Fact]
        public async Task GetByIdAsync_ValidId_ReturnsUserDto()
        {
            // Arrange
            var userId = 1;
            var user = new User
            {
                Id = userId,
                FullName = "Test User",
                Email = "test@test.com",
                PhoneNumber = "1234567890",
                PasswordHash = "hashedpassword",
                Role = UserRole.Customer
            };
            var userDto = new UserReadDto
            {
                Id = userId,
                FullName = "Test User",
                Email = "test@test.com",
                Role = "Customer"
            };

            _mockUserRepository.Setup(x => x.GetByIdAsync(userId))
                .ReturnsAsync(user);
            _mockMapper.Setup(x => x.Map<UserReadDto>(user))
                .Returns(userDto);

            // Act
            var result = await _userService.GetByIdAsync(userId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(userId, result.Id);
            Assert.Equal("Test User", result.FullName);
            Assert.Equal("test@test.com", result.Email);
        }

        [Fact]
        public async Task GetByIdAsync_InvalidId_ReturnsNull()
        {
            // Arrange
            var userId = 999;
            _mockUserRepository.Setup(x => x.GetByIdAsync(userId))
                .ReturnsAsync((User?)null);

            // Act
            var result = await _userService.GetByIdAsync(userId);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreateAsync_ValidUser_CreatesSuccessfully()
        {
            // Arrange
            var dto = new UserCreateDto
            {
                FullName = "New User",
                Email = "new@test.com",
                Password = "password123",
                Role = UserRole.Customer
            };

            var user = new User
            {
                Id = 1,
                FullName = "New User",
                Email = "new@test.com",
                PhoneNumber = "1234567890",
                PasswordHash = "hashedpassword",
                Role = UserRole.Customer
            };

            var userDto = new UserReadDto
            {
                Id = 1,
                FullName = "New User",
                Email = "new@test.com",
                Role = "Customer"
            };

            _mockUserRepository.Setup(x => x.GetByEmailAsync(dto.Email))
                .ReturnsAsync((User?)null);
            _mockMapper.Setup(x => x.Map<User>(dto))
                .Returns(user);
            _mockPasswordHasher.Setup(x => x.HashPassword(dto.Password))
                .Returns("hashedpassword");
            _mockUserRepository.Setup(x => x.AddAsync(It.IsAny<User>()))
                .Returns(Task.CompletedTask);
            _mockUserRepository.Setup(x => x.SaveAsync())
                .Returns(Task.CompletedTask);
            _mockMapper.Setup(x => x.Map<UserReadDto>(It.IsAny<User>()))
                .Returns(userDto);

            // Act
            var result = await _userService.CreateAsync(dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("New User", result.FullName);
            Assert.Equal("new@test.com", result.Email);
            _mockUserRepository.Verify(x => x.AddAsync(It.IsAny<User>()), Times.Once);
            _mockPasswordHasher.Verify(x => x.HashPassword(dto.Password), Times.Once);
        }

        [Fact]
        public async Task CreateAsync_ExistingEmail_ReturnsNull()
        {
            // Arrange
            var dto = new UserCreateDto
            {
                FullName = "New User",
                Email = "existing@test.com",
                Password = "password123"
            };

            var existingUser = new User
            {
                Id = 1,
                FullName = "Existing User",
                Email = "existing@test.com",
                PhoneNumber = "1234567890",
                PasswordHash = "hashedpassword"
            };

            _mockUserRepository.Setup(x => x.GetByEmailAsync(dto.Email))
                .ReturnsAsync(existingUser);

            // Act
            var result = await _userService.CreateAsync(dto);

            // Assert
            Assert.Null(result);
            _mockUserRepository.Verify(x => x.AddAsync(It.IsAny<User>()), Times.Never);
        }

        [Fact]
        public async Task UpdateAsync_ValidUser_UpdatesSuccessfully()
        {
            // Arrange
            var userId = 1;
            var dto = new UserUpdateDto
            {
                FullName = "Updated User",
                PhoneNumber = "1234567890"
            };

            var user = new User
            {
                Id = userId,
                FullName = "Original User",
                Email = "test@test.com",
                PhoneNumber = "0987654321",
                PasswordHash = "hashedpassword"
            };

            var updatedDto = new UserReadDto
            {
                Id = userId,
                FullName = "Updated User",
                Email = "test@test.com"
            };

            _mockUserRepository.Setup(x => x.GetByIdAsync(userId))
                .ReturnsAsync(user);
            _mockMapper.Setup(x => x.Map(dto, user));
            _mockUserRepository.Setup(x => x.UpdateAsync(It.IsAny<User>()))
                .Returns(Task.CompletedTask);
            _mockUserRepository.Setup(x => x.SaveAsync())
                .Returns(Task.CompletedTask);
            _mockMapper.Setup(x => x.Map<UserReadDto>(user))
                .Returns(updatedDto);

            // Act
            var result = await _userService.UpdateAsync(userId, dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(userId, result.Id);
            _mockUserRepository.Verify(x => x.UpdateAsync(user), Times.Once);
            _mockUserRepository.Verify(x => x.SaveAsync(), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_InvalidUser_ReturnsEmptyDto()
        {
            // Arrange
            var userId = 999;
            var dto = new UserUpdateDto { FullName = "Updated User" };

            _mockUserRepository.Setup(x => x.GetByIdAsync(userId))
                .ReturnsAsync((User?)null);

            // Act
            var result = await _userService.UpdateAsync(userId, dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(0, result.Id);
            _mockUserRepository.Verify(x => x.UpdateAsync(It.IsAny<User>()), Times.Never);
        }

        [Fact]
        public async Task DeleteAsync_ValidUser_SoftDeletesSuccessfully()
        {
            // Arrange
            var userId = 1;
            var user = new User
            {
                Id = userId,
                FullName = "Test User",
                Email = "test@test.com",
                PhoneNumber = "1234567890",
                PasswordHash = "hashedpassword",
                IsDeleted = false
            };

            _mockUserRepository.Setup(x => x.GetByIdAsync(userId))
                .ReturnsAsync(user);
            _mockUserRepository.Setup(x => x.UpdateAsync(It.IsAny<User>()))
                .Returns(Task.CompletedTask);
            _mockUserRepository.Setup(x => x.SaveAsync())
                .Returns(Task.CompletedTask);

            // Act
            var result = await _userService.DeleteAsync(userId);

            // Assert
            Assert.True(result);
            Assert.True(user.IsDeleted);
            _mockUserRepository.Verify(x => x.UpdateAsync(user), Times.Once);
        }

        [Fact]
        public async Task AuthenticateAsync_ValidCredentials_ReturnsUserDto()
        {
            // Arrange
            var email = "test@test.com";
            var password = "password123";
            var hashedPassword = "hashedpassword";

            var user = new User
            {
                Id = 1,
                Email = email,
                PasswordHash = hashedPassword,
                FullName = "Test User",
                PhoneNumber = "1234567890",
                IsDeleted = false
            };

            var userDto = new UserReadDto
            {
                Id = 1,
                Email = email,
                FullName = "Test User"
            };

            _mockUserRepository.Setup(x => x.GetByEmailAsync(email))
                .ReturnsAsync(user);
            _mockPasswordHasher.Setup(x => x.VerifyPassword(password, hashedPassword))
                .Returns(true);
            _mockMapper.Setup(x => x.Map<UserReadDto>(user))
                .Returns(userDto);

            // Act
            var result = await _userService.AuthenticateAsync(email, password);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(email, result.Email);
            Assert.Equal("Test User", result.FullName);
        }

        [Fact]
        public async Task GetAllUsersAsync_ReturnsAllUsers()
        {
            // Arrange
            var users = new List<User>
            {
                new User { Id = 1, FullName = "User 1", Email = "user1@test.com", PhoneNumber = "1234567890", PasswordHash = "hash1" },
                new User { Id = 2, FullName = "User 2", Email = "user2@test.com", PhoneNumber = "1234567891", PasswordHash = "hash2" }
            };

            var userDtos = new List<UserReadDto>
            {
                new UserReadDto { Id = 1, FullName = "User 1", Email = "user1@test.com" },
                new UserReadDto { Id = 2, FullName = "User 2", Email = "user2@test.com" }
            };

            _mockUserRepository.Setup(x => x.GetAllAsync())
                .ReturnsAsync(users);
            _mockMapper.Setup(x => x.Map<IEnumerable<UserReadDto>>(users))
                .Returns(userDtos);

            // Act
            var result = await _userService.GetAllUsersAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task ChangePasswordAsync_ValidCredentials_ChangesPassword()
        {
            // Arrange
            var userId = 1;
            var currentPassword = "oldpassword";
            var newPassword = "newpassword";
            var currentHash = "oldhash";
            var newHash = "newhash";

            var user = new User
            {
                Id = userId,
                FullName = "Test User",
                Email = "test@test.com",
                PhoneNumber = "1234567890",
                PasswordHash = currentHash
            };

            _mockUserRepository.Setup(x => x.GetUserByIdAsync(userId))
                .ReturnsAsync(user);
            _mockPasswordHasher.Setup(x => x.VerifyPassword(currentPassword, currentHash))
                .Returns(true);
            _mockPasswordHasher.Setup(x => x.HashPassword(newPassword))
                .Returns(newHash);
            _mockUserRepository.Setup(x => x.UpdateAsync(It.IsAny<User>()))
                .Returns(Task.CompletedTask);
            _mockUserRepository.Setup(x => x.SaveAsync())
                .Returns(Task.CompletedTask);

            // Act
            var result = await _userService.ChangePasswordAsync(userId, currentPassword, newPassword);

            // Assert
            Assert.True(result);
            Assert.Equal(newHash, user.PasswordHash);
            _mockUserRepository.Verify(x => x.UpdateAsync(user), Times.Once);
        }
    }
}
using AutoMapper;
using Microsoft.Extensions.Logging;
using OnlineBank.Core.DTOs.UserDtos;
using OnlineBank.Core.Interfaces;
using OnlineBank.Core.Models;
using OnlineBank.Core.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OnlineBankSimulation.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<UserService> _logger;
        private readonly IPasswordHasher _passwordHasher;

        public UserService(IUserRepository userRepository, IMapper mapper, ILogger<UserService> logger, IPasswordHasher passwordHasher)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _logger = logger;
            _passwordHasher = passwordHasher;
        }

        public async Task<IEnumerable<UserReadDto>> GetAllAsync(int pageNumber, int pageSize, string? searchTerm = null)
        {
            try
            {
                var users = await _userRepository.GetAllUsersAsync();
                return _mapper.Map<IEnumerable<UserReadDto>>(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all users with pagination");
                return new List<UserReadDto>();
            }
        }

        public async Task<UserReadDto?> GetByIdAsync(int id)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(id);
                if (user == null)
                {
                    _logger.LogWarning("User with ID {UserId} not found", id);
                    return null;
                }
                return _mapper.Map<UserReadDto>(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user by ID {UserId}", id);
                return null;
            }
        }

        public async Task<UserReadDto?> CreateAsync(UserCreateDto dto)
        {
            try
            {
                var existing = await _userRepository.GetByEmailAsync(dto.Email);
                if (existing != null)
                {
                    _logger.LogWarning("Email {Email} already exists", dto.Email);
                    return null;
                }

                var user = _mapper.Map<User>(dto);
                user.PasswordHash = _passwordHasher.HashPassword(dto.Password);
                user.CreatedAt = DateTime.UtcNow;
                user.CreatedBy = "system";
                user.IsDeleted = false;

                await _userRepository.AddAsync(user);
                await _userRepository.SaveAsync();

                _logger.LogInformation("User created with ID {UserId}", user.Id);
                return _mapper.Map<UserReadDto>(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return null;
            }
        }

        public async Task<UserReadDto> UpdateAsync(int id, UserUpdateDto dto)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(id);
                if (user == null)
                {
                    _logger.LogWarning("User with ID {UserId} not found for update", id);
                    return new UserReadDto();
                }

                _mapper.Map(dto, user);
                user.UpdatedAt = DateTime.UtcNow;
                user.UpdatedBy = "system";

                await _userRepository.UpdateAsync(user);
                await _userRepository.SaveAsync();

                _logger.LogInformation("User with ID {UserId} updated", id);
                return _mapper.Map<UserReadDto>(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user with ID {UserId}", id);
                return new UserReadDto();
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(id);
                if (user == null)
                {
                    _logger.LogWarning("User with ID {UserId} not found for deletion", id);
                    return false;
                }

                user.IsDeleted = true;
                user.UpdatedAt = DateTime.UtcNow;
                user.UpdatedBy = "system";

                await _userRepository.UpdateAsync(user);
                await _userRepository.SaveAsync();

                _logger.LogInformation("User with ID {UserId} deleted", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user with ID {UserId}", id);
                return false;
            }
        }

        public async Task<UserReadDto?> AuthenticateAsync(string email, string password)
        {
            try
            {
                var user = await _userRepository.GetByEmailAsync(email);
                if (user == null || !_passwordHasher.VerifyPassword(password, user.PasswordHash))
                {
                    _logger.LogWarning("Invalid credentials for email {Email}", email);
                    return null;
                }

                if (user.IsDeleted)
                {
                    _logger.LogWarning("User with email {Email} is deactivated", email);
                    return null;
                }

                _logger.LogInformation("User with email {Email} logged in successfully", email);
                return _mapper.Map<UserReadDto>(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error authenticating user with email {Email}", email);
                return null;
            }
        }

        public async Task<bool> ChangePasswordAsync(int userId, string oldPassword, string newPassword)
        {
            try
            {
                var user = await _userRepository.GetUserByIdAsync(userId);
                if (user == null) return false;

                if (!_passwordHasher.VerifyPassword(oldPassword, user.PasswordHash))
                    return false;
                
                user.PasswordHash = _passwordHasher.HashPassword(newPassword);
                await _userRepository.UpdateAsync(user);
                await _userRepository.SaveAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for user {UserId}", userId);
                return false;
            }
        }

        public async Task<int?> GetUserBranchIdAsync(int userId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                return user?.BranchId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting branch ID for user {UserId}", userId);
                return null;
            }
        }

        public async Task<IEnumerable<UserReadDto>> GetAllUsersAsync()
        {
            try
            {
                var users = await _userRepository.GetAllAsync();
                return _mapper.Map<IEnumerable<UserReadDto>>(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all users");
                return new List<UserReadDto>();
            }
        }

        public async Task<(bool Success, string Message, UserReadDto? Data)> UpdateProfileAsync(int userId, UpdateProfileDto dto)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                    return (false, "User not found", null);

                user.FullName = dto.FullName;
                user.PhoneNumber = dto.PhoneNumber;
                user.UpdatedAt = DateTime.UtcNow;

                await _userRepository.UpdateAsync(user);
                await _userRepository.SaveAsync();

                var updatedUser = _mapper.Map<UserReadDto>(user);
                return (true, "Profile updated successfully", updatedUser);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating profile for user {UserId}", userId);
                return (false, "Error updating profile", null);
            }
        }

        public async Task<UserReadDto?> GetByEmailAsync(string email)
        {
            try
            {
                var user = await _userRepository.GetByEmailAsync(email);
                return user != null ? _mapper.Map<UserReadDto>(user) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user by email {Email}", email);
                return null;
            }
        }

        public async Task<bool> ResetPasswordAsync(string email, string newPassword)
        {
            try
            {
                var user = await _userRepository.GetByEmailAsync(email);
                if (user == null) return false;

                user.PasswordHash = _passwordHasher.HashPassword(newPassword);
                await _userRepository.UpdateAsync(user);
                await _userRepository.SaveAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password for email {Email}", email);
                return false;
            }
        }
    }
}
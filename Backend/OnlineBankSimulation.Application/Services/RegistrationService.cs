using AutoMapper;
using Microsoft.Extensions.Logging;
using OnlineBank.Core.DTOs;
using OnlineBank.Core.DTOs.UserDtos;
using OnlineBank.Core.Enums;
using OnlineBank.Core.Models;
using OnlineBank.Core.Repository;
using OnlineBank.Core.Repositories;
using OnlineBank.Core.Services;
using OnlineBank.Core.Interfaces;
using OnlineBank.Core.Constants;
using OnlineBank.Core.Common;
using IEmailService = OnlineBankSimulation.Application.Interfaces.IEmailService;

namespace OnlineBankSimulation.Application.Services
{
    public class RegistrationService : OnlineBank.Core.Services.IRegistrationService
    {
        private readonly IUserRepository _userRepository;
        private readonly IBranchRepository _branchRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly OnlineBank.Core.Interfaces.IOtpService _otpService;
        private readonly IMapper _mapper;
        private readonly ILogger<RegistrationService> _logger;
        private readonly IEmailService _emailService;

        public RegistrationService(
            IUserRepository userRepository,
            IBranchRepository branchRepository,
            IPasswordHasher passwordHasher,
            OnlineBank.Core.Interfaces.IOtpService otpService,
            IMapper mapper,
            ILogger<RegistrationService> logger,
            IEmailService emailService)
        {
            _userRepository = userRepository;
            _branchRepository = branchRepository;
            _passwordHasher = passwordHasher;
            _otpService = otpService;
            _mapper = mapper;
            _logger = logger;
            _emailService = emailService;
        }

        public async Task<ServiceResult<UserResponseDto>> RegisterCustomerAsync(SimpleCustomerRegistrationDto dto)
        {
            try
            {
                // 🔒 MANDATORY: Check if email is OTP verified
                var isEmailVerified = await _otpService.IsEmailVerifiedAsync(dto.Email, OtpPurpose.Registration);
                if (!isEmailVerified)
                    return ServiceResult<UserResponseDto>.FailureResult("Please verify your email with OTP first before registration.");

                // Check if email already exists
                var existingUser = await _userRepository.GetByEmailAsync(dto.Email);
                if (existingUser != null)
                    return ServiceResult<UserResponseDto>.FailureResult("Email already exists");

                // Validate age (must be 18+)
                var age = DateTime.UtcNow.Year - dto.DateOfBirth.Year;
                if (dto.DateOfBirth > DateTime.UtcNow.AddYears(-age)) age--;
                if (age < 18 || age > 100)
                    return ServiceResult<UserResponseDto>.FailureResult("Age must be between 18 and 100");

                // Assign to main branch automatically
                var mainBranch = await _branchRepository.GetMainBranchAsync();
                if (mainBranch == null)
                    return ServiceResult<UserResponseDto>.FailureResult("No main branch found");

                // Create user
                var user = new User
                {
                    FullName = dto.FullName,
                    Email = dto.Email,
                    PhoneNumber = dto.PhoneNumber,
                    PasswordHash = _passwordHasher.HashPassword(dto.Password),
                    Address = dto.Address,
                    DateOfBirth = dto.DateOfBirth,
                    Role = UserRole.Customer,
                    Status = UserStatus.Approved,
                    BranchId = mainBranch.Id,
                    IsEmailVerified = true, // Set to true since OTP was verified
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System"
                };

                await _userRepository.AddUserAsync(user);
                
                // Send welcome email (account is active)
                var welcomeMessage = $"Welcome to Online Bank! Your account has been created and is now active. You can log in and start using all our banking services.";
                await _emailService.SendWelcomeEmailAsync(dto.Email, welcomeMessage);
                
                _logger.LogInformation("Customer registration completed for {Email}", dto.Email);
                return ServiceResult<UserResponseDto>.SuccessResult(_mapper.Map<UserResponseDto>(user), "Customer registered successfully");
            }
            catch (Exception ex)
            {
                // Send registration failure email
                try
                {
                    var failureMessage = $"We're sorry, but your registration attempt failed. Please try again or contact our support team for assistance. Error: Registration could not be completed at this time.";
                    await _emailService.SendWelcomeEmailAsync(dto.Email, failureMessage);
                }
                catch (Exception emailEx)
                {
                    _logger.LogError(emailEx, "Failed to send registration failure email to {Email}", dto.Email);
                }
                
                _logger.LogError(ex, "Error registering customer {Email}", dto.Email);
                return ServiceResult<UserResponseDto>.FailureResult($"Registration failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<UserResponseDto>> CreateEmployeeAsync(CreateEmployeeDto dto)
        {
            try
            {
                // Check if email already exists
                var existingUser = await _userRepository.GetByEmailAsync(dto.Email);
                if (existingUser != null)
                    return ServiceResult<UserResponseDto>.FailureResult("Email already exists");

                // Validate branch exists
                var branch = await _branchRepository.GetByIdAsync(dto.BranchId);
                if (branch == null)
                    return ServiceResult<UserResponseDto>.FailureResult("Branch not found");

                // Check if branch already has a branch manager
                if (dto.Role == UserRole.BranchManager)
                {
                    var hasBranchManager = await _userRepository.HasBranchManagerAsync(dto.BranchId);
                    if (hasBranchManager)
                        return ServiceResult<UserResponseDto>.FailureResult($"Branch '{branch.BranchName}' already has a branch manager");
                }

                // Generate employee code and temporary password
                var employeeCode = await GenerateEmployeeCodeAsync(dto.BranchId);
                var tempPassword = GenerateTemporaryPassword();

                // Create employee
                var user = new User
                {
                    FullName = dto.FullName,
                    Email = dto.Email,
                    PhoneNumber = dto.PhoneNumber,
                    PasswordHash = _passwordHasher.HashPassword(tempPassword),
                    Address = dto.Address,
                    DateOfBirth = dto.DateOfBirth,
                    Role = dto.Role,
                    Status = UserStatus.Approved,
                    BranchId = dto.BranchId,
                    EmployeeCode = employeeCode,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "Admin"
                };

                await _userRepository.AddUserAsync(user);
                
                // Send email with temporary password
                var emailMessage = $"Welcome to Online Bank!\n\n" +
                    $"Your {dto.Role} account has been created.\n\n" +
                    $"Login Details:\n" +
                    $"Email: {dto.Email}\n" +
                    $"Temporary Password: {tempPassword}\n\n" +
                    $"IMPORTANT: You must change this password on your first login.\n\n" +
                    $"Please keep this information secure and do not share it with anyone.";
                
                try
                {
                    await _emailService.SendWelcomeEmailAsync(dto.Email, emailMessage);
                    _logger.LogInformation("Temporary password email sent to {Email}", dto.Email);
                }
                catch (Exception emailEx)
                {
                    _logger.LogWarning(emailEx, "Failed to send temporary password email to {Email}", dto.Email);
                }
                
                _logger.LogInformation("{Role} created: {Email}", dto.Role.ToString(), dto.Email);
                
                var response = _mapper.Map<UserResponseDto>(user);
                response.TempPassword = tempPassword;
                var roleMessage = dto.Role == UserRole.BranchManager ? "Branch Manager" : dto.Role.ToString();
                return ServiceResult<UserResponseDto>.SuccessResult(response, $"{roleMessage} created successfully. Temporary password sent via email.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating employee {Email}", dto.Email);
                return ServiceResult<UserResponseDto>.FailureResult($"Employee creation failed: {ex.Message}");
            }
        }



        private async Task<string> GenerateBankManagerCodeAsync(int branchId)
        {
            var branch = await _branchRepository.GetByIdAsync(branchId);
            var branchCode = branch?.BranchCode ?? "BR";
            var timestamp = DateTime.UtcNow.ToString("yyyyMMdd");
            var random = new Random().Next(100, 999);
            return $"{branchCode}{timestamp}{random}";
        }

        public async Task<ServiceResult<object>> ChangePasswordAsync(int userId, ChangePasswordDto dto)
        {
            try
            {
                var user = await _userRepository.GetUserByIdAsync(userId);
                if (user == null)
                    return ServiceResult<object>.FailureResult("User not found");

                // Verify current password
                if (!_passwordHasher.VerifyPassword(dto.CurrentPassword, user.PasswordHash))
                    return ServiceResult<object>.FailureResult("Current password is incorrect");

                // Update password
                user.PasswordHash = _passwordHasher.HashPassword(dto.NewPassword);
                user.UpdatedAt = DateTime.UtcNow;
                user.UpdatedBy = user.Email;

                await _userRepository.UpdateAsync(user);
                
                _logger.LogInformation("Password changed for user {UserId}", userId);
                return ServiceResult<object>.SuccessResult(new { }, "Password changed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for user {UserId}", userId);
                return ServiceResult<object>.FailureResult($"Password change failed: {ex.Message}");
            }
        }

        private async Task<string> GenerateEmployeeCodeAsync(int branchId)
        {
            var branch = await _branchRepository.GetByIdAsync(branchId);
            var branchCode = branch?.BranchCode ?? "BR";
            var timestamp = DateTime.UtcNow.ToString("yyyyMMdd");
            var random = new Random().Next(100, 999);
            return $"{branchCode}{timestamp}{random}";
        }

        private static string GenerateTemporaryPassword()
        {
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 12)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        public async Task<ServiceResult<UserResponseDto>> UpdateEmployeeAsync(int id, UpdateEmployeeDto dto)
        {
            try
            {
                var user = await _userRepository.GetUserByIdAsync(id);
                if (user == null)
                    return ServiceResult<UserResponseDto>.FailureResult("User not found");

                if (user.Role == UserRole.Customer)
                    return ServiceResult<UserResponseDto>.FailureResult("Cannot update customer through this endpoint");

                if (user.Role != UserRole.BranchManager && user.Role != UserRole.Admin)
                    return ServiceResult<UserResponseDto>.FailureResult("Invalid user role for this operation");

                // Update user properties
                user.FullName = dto.FullName ?? user.FullName;
                user.PhoneNumber = dto.PhoneNumber ?? user.PhoneNumber;
                user.Address = dto.Address ?? user.Address;
                user.UpdatedAt = DateTime.UtcNow;
                user.UpdatedBy = "Admin";

                await _userRepository.UpdateAsync(user);
                
                _logger.LogInformation("User {Id} updated successfully", id);
                return ServiceResult<UserResponseDto>.SuccessResult(_mapper.Map<UserResponseDto>(user), "User updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {Id}", id);
                return ServiceResult<UserResponseDto>.FailureResult($"Update failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<object>> DeactivateEmployeeAsync(int id)
        {
            try
            {
                var user = await _userRepository.GetUserByIdAsync(id);
                if (user == null)
                    return ServiceResult<object>.FailureResult("User not found");

                if (user.Role == UserRole.Customer)
                    return ServiceResult<object>.FailureResult("Cannot deactivate customer through this endpoint");

                if (user.Role != UserRole.BranchManager && user.Role != UserRole.Admin)
                    return ServiceResult<object>.FailureResult("Invalid user role for this operation");

                user.IsActive = false;
                user.Status = UserStatus.Rejected;
                user.UpdatedAt = DateTime.UtcNow;
                user.UpdatedBy = "Admin";

                await _userRepository.UpdateAsync(user);
                
                _logger.LogInformation("User {Id} deactivated successfully", id);
                return ServiceResult<object>.SuccessResult(new { }, "User deactivated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating user {Id}", id);
                return ServiceResult<object>.FailureResult($"Deactivation failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<object>> ResetEmployeePasswordAsync(int id)
        {
            try
            {
                var user = await _userRepository.GetUserByIdAsync(id);
                if (user == null)
                    return ServiceResult<object>.FailureResult("User not found");

                if (user.Role == UserRole.Customer)
                    return ServiceResult<object>.FailureResult("Cannot reset customer password through this endpoint");

                if (user.Role != UserRole.BranchManager && user.Role != UserRole.Admin)
                    return ServiceResult<object>.FailureResult("Invalid user role for this operation");

                var newTempPassword = GenerateTemporaryPassword();
                user.PasswordHash = _passwordHasher.HashPassword(newTempPassword);
                user.UpdatedAt = DateTime.UtcNow;
                user.UpdatedBy = "Admin";

                await _userRepository.UpdateAsync(user);

                // Send email with new temporary password
                var emailMessage = $"Your password has been reset by an administrator.\n\n" +
                    $"New Temporary Password: {newTempPassword}\n\n" +
                    $"IMPORTANT: You must change this password on your next login.\n\n" +
                    $"Please keep this information secure.";
                
                try
                {
                    await _emailService.SendWelcomeEmailAsync(user.Email, emailMessage);
                }
                catch (Exception emailEx)
                {
                    _logger.LogWarning(emailEx, "Failed to send password reset email to {Email}", user.Email);
                }
                
                _logger.LogInformation("Password reset for user {Id}", id);
                return ServiceResult<object>.SuccessResult(new { TempPassword = newTempPassword }, "Password reset successfully. New temporary password sent via email.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password for user {Id}", id);
                return ServiceResult<object>.FailureResult($"Password reset failed: {ex.Message}");
            }
        }
    }
}
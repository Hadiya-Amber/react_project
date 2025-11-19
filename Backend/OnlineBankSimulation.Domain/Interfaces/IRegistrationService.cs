using OnlineBank.Core.Common;
using OnlineBank.Core.DTOs;
using OnlineBank.Core.DTOs.UserDtos;

namespace OnlineBank.Core.Services
{
    public interface IRegistrationService
    {
        Task<ServiceResult<UserResponseDto>> RegisterCustomerAsync(SimpleCustomerRegistrationDto dto);
        Task<ServiceResult<UserResponseDto>> CreateEmployeeAsync(CreateEmployeeDto dto);
        Task<ServiceResult<object>> ChangePasswordAsync(int userId, ChangePasswordDto dto);
        Task<ServiceResult<UserResponseDto>> UpdateEmployeeAsync(int id, UpdateEmployeeDto dto);
        Task<ServiceResult<object>> DeactivateEmployeeAsync(int id);
        Task<ServiceResult<object>> ResetEmployeePasswordAsync(int id);
    }
}
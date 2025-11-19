using OnlineBank.Core.DTOs;
using OnlineBank.Core.Common;
using OnlineBank.Core.DTOs.UserDtos;

namespace OnlineBankSimulation.Application.Interfaces
{
    public interface IRegistrationService
    {
        Task<UserResponseDto> RegisterCustomerAsync(RegisterCustomerDto dto);
        Task<UserResponseDto> CreateEmployeeAsync(CreateEmployeeDto dto);
        Task<UserResponseDto> ApproveUserAsync(int userId);
        Task<UserResponseDto> RejectUserAsync(int userId, string reason);
        Task<IEnumerable<UserResponseDto>> GetPendingUsersAsync();
        Task<ServiceResult<UserResponseDto>> UpdateEmployeeAsync(int id, UpdateEmployeeDto dto);
        Task<ServiceResult<object>> DeactivateEmployeeAsync(int id);
        Task<ServiceResult<object>> ResetEmployeePasswordAsync(int id);
    }
}
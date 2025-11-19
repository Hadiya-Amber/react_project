using System.Collections.Generic;
using System.Threading.Tasks;
using OnlineBank.Core.DTOs.UserDtos;
using OnlineBank.Core.Common;

namespace OnlineBank.Core.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserReadDto>> GetAllAsync(int pageNumber, int pageSize, string? searchTerm = null);
        Task<UserReadDto?> GetByIdAsync(int id);
        Task<UserReadDto?> CreateAsync(UserCreateDto dto);
        Task<UserReadDto> UpdateAsync(int id, UserUpdateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<UserReadDto?> AuthenticateAsync(string email, string password);
        Task<bool> ChangePasswordAsync(int userId, string oldPassword, string newPassword);
        Task<int?> GetUserBranchIdAsync(int userId);
        Task<IEnumerable<UserReadDto>> GetAllUsersAsync();
        Task<(bool Success, string Message, UserReadDto? Data)> UpdateProfileAsync(int userId, UpdateProfileDto dto);
        Task<UserReadDto?> GetByEmailAsync(string email);
        Task<bool> ResetPasswordAsync(string email, string newPassword);
    }
}

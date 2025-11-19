using OnlineBank.Core.DTOs.UserDtos;

namespace OnlineBankSimulation.Application.Interfaces
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
    }
}
using OnlineBank.Core.DTOs.UserDtos;

namespace OnlineBank.Core.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    }
}
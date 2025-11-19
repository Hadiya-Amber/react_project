using System.Threading.Tasks;

namespace OnlineBank.Core.Interfaces
{
    public interface IPasswordResetService
    {
        Task<string> GenerateResetCodeAsync(string email);
        Task<bool> ValidateResetCodeAsync(string email, string code);
        Task<bool> SendResetEmailAsync(string email, string resetCode);
    }
}
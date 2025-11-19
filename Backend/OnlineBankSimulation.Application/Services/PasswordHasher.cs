using OnlineBank.Core.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace OnlineBankSimulation.Application.Services
{
    public class PasswordHasher : IPasswordHasher
    {
        public string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var salt = GenerateSalt();
            var passwordWithSalt = password + salt;
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(passwordWithSalt));
            return Convert.ToBase64String(hashedBytes) + ":" + salt;
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            var parts = hashedPassword.Split(':');
            if (parts.Length != 2) return false;

            var hash = parts[0];
            var salt = parts[1];

            using var sha256 = SHA256.Create();
            var passwordWithSalt = password + salt;
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(passwordWithSalt));
            var computedHash = Convert.ToBase64String(hashedBytes);

            return hash == computedHash;
        }

        private string GenerateSalt()
        {
            var saltBytes = new byte[16];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(saltBytes);
            return Convert.ToBase64String(saltBytes);
        }
    }
}
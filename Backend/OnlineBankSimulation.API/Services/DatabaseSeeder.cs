using Microsoft.EntityFrameworkCore;
using OnlineBank.Core.Interfaces;
using OnlineBank.Core.Enums;
using OnlineBank.Core.Models;
using OnlineBankSimulation.Application.Data;

namespace OnlineBank.API.Services
{
    public class DatabaseSeeder
    {
        private readonly OnlineBankDbContext _context;
        private readonly IPasswordHasher _passwordHasher;

        public DatabaseSeeder(OnlineBankDbContext context, IPasswordHasher passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        public async Task SeedAsync()
        {
            Console.WriteLine("🚀 Seeder started...");

            // Fix branch data first
            await FixBranchDataAsync();

            var existingAdmin = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == "admin@onlinebank.com");

            if (existingAdmin != null)
            {
                Console.WriteLine("⚠️ Admin already exists, skipping seed.");
                return;
            }

            // Get the first branch from seed data
            var branch = await _context.Branches.FirstAsync();

            var adminUser = new User
            {
                FullName = "System Administrator",
                Email = "admin@onlinebank.com",
                PhoneNumber = "9321578963",
                PasswordHash = _passwordHasher.HashPassword("Admin@123"),
                Role = UserRole.Admin,
                Status = UserStatus.Approved,
                Address = "Bank Headquarters",
                DateOfBirth = new DateTime(1980, 1, 1),
                BranchId = branch.Id,
                IsActive = true,
                IsEmailVerified = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System",
                IsDeleted = false
            };

            _context.Users.Add(adminUser);
            await _context.SaveChangesAsync();

            // Create sample account for the admin user
            var sampleAccount = new Account
            {
                UserId = adminUser.Id,
                BranchId = branch.Id,
                AccountNumber = "ACC001234567890",
                Type = AccountType.Savings,
                Balance = 10000.00m,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System",
                IsDeleted = false
            };

            _context.Accounts.Add(sampleAccount);
            await _context.SaveChangesAsync();

            Console.WriteLine("✅ Admin user and sample account created successfully!");
        }

        private async Task FixBranchDataAsync()
        {
            var branchToFix = await _context.Branches
                .FirstOrDefaultAsync(b => b.Id == 4 && (string.IsNullOrEmpty(b.City) || string.IsNullOrEmpty(b.State)));

            if (branchToFix != null)
            {
                branchToFix.City = "Mumbai";
                branchToFix.State = "Maharashtra";
                await _context.SaveChangesAsync();
                Console.WriteLine("✅ Fixed branch data for branch ID 4");
            }
        }
    }
}
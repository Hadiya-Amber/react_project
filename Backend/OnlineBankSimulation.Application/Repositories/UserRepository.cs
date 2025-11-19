using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using OnlineBank.Core.Enums;
using OnlineBank.Core.Models;
using OnlineBank.Core.Repositories;
using OnlineBankSimulation.Application.Data;
using System.Data;

namespace OnlineBankSimulation.Application.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        private readonly OnlineBankDbContext _context;
        private readonly string _connectionString;

        public UserRepository(OnlineBankDbContext context, IConfiguration configuration)
            : base(context)
        {
            _context = context;
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }
        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                var users = await connection.QueryAsync<User>("GetAllUsers", commandType: CommandType.StoredProcedure);
                return users;
            }
            catch (Exception)
            {
                return await _context.Users
                    .Where(u => !u.IsDeleted)
                    .ToListAsync();
            }
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                var parameters = new { UserId = id };
                var user = await connection.QueryFirstOrDefaultAsync<User>(
                    "GetUserById",
                    parameters,
                    commandType: CommandType.StoredProcedure);
                return user;
            }
            catch (Exception)
            {
                return await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
            }
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                var parameters = new { Email = email };
                var user = await connection.QueryFirstOrDefaultAsync<User>(
                    "GetUserByEmail",
                    parameters,
                    commandType: CommandType.StoredProcedure);
                return user;
            }
            catch (Exception)
            {
                return await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted);
            }
        }

        public async Task<IEnumerable<User>> GetUsersByStatusAsync(UserStatus status)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                var parameters = new { Status = (int)status };
                var users = await connection.QueryAsync<User>(
                    "GetUsersByStatus",
                    parameters,
                    commandType: CommandType.StoredProcedure);
                return users;
            }
            catch (Exception)
            {
                return await _context.Users
                    .Where(u => u.Status == status && !u.IsDeleted)
                    .ToListAsync();
            }
        }

        public async Task<IEnumerable<User>> GetBranchManagersAsync()
        {
            return await GetUsersByRoleAsync(UserRole.BranchManager);
        }

        public async Task<IEnumerable<User>> GetUsersByRoleAsync(UserRole role)
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                var parameters = new { Role = (int)role };
                var users = await connection.QueryAsync<User>(
                    "GetUsersByRole",
                    parameters,
                    commandType: CommandType.StoredProcedure);
                return users;
            }
            catch (Exception)
            {
                return await _context.Users
                    .Where(u => u.Role == role && !u.IsDeleted)
                    .ToListAsync();
            }
        }

        public async Task<IEnumerable<User>> GetCustomersAsync()
        {
            return await GetUsersByRoleAsync(UserRole.Customer);
        }

        public async Task<IEnumerable<User>> GetAdminsAsync()
        {
            return await GetUsersByRoleAsync(UserRole.Admin);
        }

        public async Task<bool> HasBranchManagerAsync(int branchId)
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand("SELECT COUNT(1) FROM Users WHERE BranchId = @BranchId AND Role = @Role AND IsActive = 1", conn);
            cmd.Parameters.AddWithValue("@BranchId", branchId);
            cmd.Parameters.AddWithValue("@Role", (int)UserRole.BranchManager);

            await conn.OpenAsync();
            var count = (int)await cmd.ExecuteScalarAsync();
            return count > 0;
        }

        public async Task<User?> GetBranchManagerByBranchIdAsync(int branchId)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.BranchId == branchId && u.Role == UserRole.BranchManager && !u.IsDeleted);
        }

        private static User MapUserFromReader(SqlDataReader reader)
        {
            return new User
            {
                Id = reader.GetInt32("Id"),
                FullName = reader.GetString("FullName"),
                Email = reader.GetString("Email"),
                PhoneNumber = reader.GetString("PhoneNumber"),
                PasswordHash = reader.GetString("PasswordHash"),
                Role = (UserRole)reader.GetInt32("Role"),
                Address = reader.IsDBNull("Address") ? null : reader.GetString("Address"),
                DateOfBirth = reader.GetDateTime("DateOfBirth"),
                Status = (UserStatus)reader.GetInt32("Status"),
                BranchId = reader.IsDBNull("BranchId") ? null : reader.GetInt32("BranchId"),
                EmployeeCode = reader.IsDBNull("EmployeeCode") ? null : reader.GetString("EmployeeCode"),
                IsActive = reader.GetBoolean("IsActive"),
                CreatedAt = reader.GetDateTime("CreatedAt"),
                UpdatedAt = reader.IsDBNull("UpdatedAt") ? null : reader.GetDateTime("UpdatedAt")
            };
        }
        public async Task AddUserAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        public void UpdateUser(User user)
        {
            _context.Users.Update(user);
        }

        public void DeleteUser(User user)
        {
            _context.Users.Remove(user);
        }

        public async Task SaveAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }
    }
}


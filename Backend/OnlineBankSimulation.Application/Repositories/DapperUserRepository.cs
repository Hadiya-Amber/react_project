using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using OnlineBank.Core.Models;
using OnlineBank.Core.Enums;
using OnlineBank.Core.Common;

namespace OnlineBankSimulation.Application.Repositories
{
    public class DapperUserRepository
    {
        private readonly string _connectionString;

        public DapperUserRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? "";
        }

        public async Task<PaginatedResult<User>> GetUsersAsync(int pageNumber = 1, int pageSize = 10)
        {
            using var connection = new SqlConnection(_connectionString);
            
            var countSql = "SELECT COUNT(*) FROM Users WHERE IsDeleted = 0";
            var totalCount = await connection.QuerySingleAsync<int>(countSql);

            var sql = @"
                SELECT * FROM Users 
                WHERE IsDeleted = 0 
                ORDER BY CreatedAt DESC
                OFFSET @Offset ROWS 
                FETCH NEXT @PageSize ROWS ONLY";

            var users = await connection.QueryAsync<User>(sql, new 
            { 
                Offset = (pageNumber - 1) * pageSize, 
                PageSize = pageSize 
            });

            return new PaginatedResult<User>
            {
                Data = users,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            using var connection = new SqlConnection(_connectionString);
            
            var sql = "SELECT * FROM Users WHERE Email = @Email AND IsDeleted = 0";
            return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Email = email });
        }
    }
}
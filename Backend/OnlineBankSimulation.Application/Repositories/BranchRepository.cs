using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using OnlineBank.Core.Models;
using OnlineBank.Core.Repositories;
using System.Data;
using OnlineBank.Core.Enums;
using OnlineBankSimulation.Application.Data;
using Microsoft.EntityFrameworkCore;

namespace OnlineBankSimulation.Application.Repositories
{
    public class BranchRepository : IBranchRepository
    {
        private readonly string _connectionString;
        private readonly OnlineBankDbContext _context;

        public BranchRepository(IConfiguration configuration, OnlineBankDbContext context)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _context = context;
        }

        public async Task<IEnumerable<Branch>> GetAllAsync()
        {
            try
            {
                using var connection = new SqlConnection(_connectionString);
                return await connection.QueryAsync<Branch>(
                    @"SELECT Id, BranchCode, BranchName, Address, City, State, IFSCCode, 
                             ManagerName, PhoneNumber, Email, PostalCode, BranchType, IsActive, IsMainBranch,
                             IsDeleted, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy 
                      FROM Branches WHERE IsDeleted = 0");
            }
            catch (SqlException ex) when (ex.Message.Contains("Invalid object name 'Branches'"))
            {
                // Return sample data if table doesn't exist
                return new List<Branch>
                {
                    new Branch
                    {
                        Id = 1,
                        BranchCode = "BR001",
                        BranchName = "Main Branch",
                        Address = "123 Main Street",
                        City = "Mumbai",
                        State = "Maharashtra",
                        IFSCCode = "BANK0000001",
                        ManagerName = "John Manager",
                        PhoneNumber = "9876543210",
                        IsActive = true
                    },
                    new Branch
                    {
                        Id = 2,
                        BranchCode = "BR002",
                        BranchName = "Delhi Branch",
                        Address = "456 Delhi Road",
                        City = "Delhi",
                        State = "Delhi",
                        IFSCCode = "BANK0000002",
                        ManagerName = "Jane Manager",
                        PhoneNumber = "9876543211",
                        IsActive = true
                    }
                };
            }
        }

        public async Task<Branch?> GetByIdAsync(int id)
        {
            return await _context.Branches
                .Where(b => b.Id == id && !b.IsDeleted)
                .FirstOrDefaultAsync();
        }

        public async Task<Branch?> GetMainBranchAsync()
        {
            using var connection = new SqlConnection(_connectionString);
            return await connection.QueryFirstOrDefaultAsync<Branch>(
                "SELECT TOP 1 * FROM Branches WHERE IsDeleted = 0 ORDER BY Id");
        }

        public async Task<IEnumerable<Branch>> GetActiveBranchesAsync()
        {
            using var connection = new SqlConnection(_connectionString);
            return await connection.QueryAsync<Branch>(
                "SELECT Id, BranchName, BranchCode, City, State, Address, IFSCCode, ManagerName, PhoneNumber, Email, PostalCode, BranchType, IsActive, IsMainBranch, IsDeleted, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy FROM Branches WHERE IsDeleted = 0");
        }

        public async Task<IEnumerable<Branch>> FindAsync(System.Linq.Expressions.Expression<Func<Branch, bool>> predicate)
        {
            return await _context.Branches.Where(predicate).Where(b => !b.IsDeleted).ToListAsync();
        }

        public async Task AddAsync(Branch entity)
        {
            await _context.Branches.AddAsync(entity);
        }

        public void Update(Branch entity)
        {
            _context.Branches.Update(entity);
        }

        public void Delete(Branch entity)
        {
            _context.Branches.Remove(entity);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
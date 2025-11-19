using Microsoft.EntityFrameworkCore;
using OnlineBank.Core.Models;

namespace OnlineBankSimulation.Application.Data
{
    public class OnlineBankDbContext : DbContext
    {
        public OnlineBankDbContext(DbContextOptions<OnlineBankDbContext> options) : base(options)
        {
        }

        public DbSet<Branch> Branches { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<OtpVerification> OtpVerifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(OnlineBankDbContext).Assembly);
        }
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using OnlineBankSimulation.Application.Data;

namespace OnlineBankSimulation.Application.Data
{
    public class OnlineBankDbContextFactory : IDesignTimeDbContextFactory<OnlineBankDbContext>
    {
        public OnlineBankDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<OnlineBankDbContext>();
            optionsBuilder.UseSqlServer("Server=LAPTOP-R68LUJKV\\SQLEXPRESS;Database=OnlineBank;Trusted_Connection=true;TrustServerCertificate=true;MultipleActiveResultSets=true;");

            return new OnlineBankDbContext(optionsBuilder.Options);
        }
    }
}
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OnlineBank.Core.Interfaces;
using OnlineBankSimulation.Application.Data;
using OnlineBank.Core.Repository;
using OnlineBank.Core.Repositories;
using OnlineBankSimulation.Application.Repositories;

namespace OnlineBankSimulation.Application
{
    public static class DataServiceRegistration
    {
        public static IServiceCollection AddDataServices(this IServiceCollection services, IConfiguration configuration)
        {
            // ✅ Register DbContext
            services.AddDbContext<OnlineBankDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

            // ✅ Register repositories
            services.AddScoped<ITransactionRepository, TransactionRepository>();
            services.AddScoped<IAccountRepository, AccountRepository>();
            services.AddScoped<IUserRepository, UserRepository>();


            return services;
        }
    }
}

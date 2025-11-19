using Microsoft.Extensions.DependencyInjection;
using OnlineBank.Core.Repository;
using OnlineBank.Core.Repositories;
using OnlineBankSimulation.Application.Repositories;

namespace OnlineBank.API.Configurations
{
    public static class RepositoryConfiguration
    {
        public static IServiceCollection AddRepositoryConfigurations(this IServiceCollection services)
        {
            // ✅ Register all repositories here
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IAccountRepository, AccountRepository>();
            services.AddScoped<ITransactionRepository, TransactionRepository>();

            services.AddScoped<IBranchRepository, BranchRepository>();
            services.AddScoped<IOtpRepository, OtpRepository>();

            return services;
        }
    }
}

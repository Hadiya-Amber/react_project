using Microsoft.Extensions.DependencyInjection;
using OnlineBankSimulation.Application.Services;
using OnlineBankSimulation.Application.Interfaces;

namespace OnlineBankSimulation.Application
{
    public static class ApplicationServiceRegistration
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<OnlineBank.Core.Interfaces.IUserService, UserService>();
            services.AddScoped<OnlineBank.Core.Services.IRegistrationService, RegistrationService>();
            services.AddScoped<OnlineBank.Core.Interfaces.IOtpService, OtpService>();
            services.AddScoped<OnlineBank.Core.Interfaces.IPasswordResetService, PasswordResetService>();
            services.AddScoped<OnlineBank.Core.Interfaces.IStatsService, StatsService>();
            
            return services;
        }
    }
}
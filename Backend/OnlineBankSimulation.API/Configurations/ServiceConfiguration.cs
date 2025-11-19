using OnlineBank.API.Services;
using OnlineBank.Core.Interfaces;

namespace OnlineBank.API.Configurations
{
    public static class ServiceConfiguration
    {
        public static IServiceCollection AddServiceConfigurations(this IServiceCollection services)
        {
            // Register services
            services.AddScoped<IUserService, OnlineBankSimulation.Application.Services.UserService>();
            services.AddScoped<IPasswordHasher, OnlineBankSimulation.Application.Services.PasswordHasher>();
            services.AddScoped<OnlineBank.Core.Interfaces.IOtpService, OnlineBankSimulation.Application.Services.OtpService>();
            services.AddScoped<OnlineBankSimulation.Application.Services.EmailService>();
            services.AddScoped<OnlineBank.Core.Interfaces.IEmailService, OnlineBankSimulation.Application.Services.EmailService>();
            services.AddScoped<OnlineBankSimulation.Application.Interfaces.IEmailService, OnlineBankSimulation.Application.Services.EmailServiceAdapter>();
            services.AddScoped<OnlineBankSimulation.Application.Interfaces.IEmailService>(provider =>
                new OnlineBankSimulation.Application.Services.EmailServiceAdapter(provider.GetRequiredService<OnlineBankSimulation.Application.Services.EmailService>()));
            services.AddScoped<OnlineBank.Core.Interfaces.ISmsService, OnlineBankSimulation.Application.Services.SmsService>();
            services.AddScoped<OnlineBank.Core.Services.IRegistrationService, OnlineBankSimulation.Application.Services.RegistrationService>();
            services.AddScoped<OnlineBank.Core.Interfaces.IAccountService, OnlineBankSimulation.Application.Services.AccountService>();
            services.AddScoped<OnlineBank.Core.Repositories.IAccountRepository, OnlineBankSimulation.Application.Repositories.AccountRepository>();
            services.AddScoped<OnlineBank.Core.Interfaces.IBranchService, OnlineBankSimulation.Application.Services.BranchService>();
            services.AddScoped<OnlineBank.Core.Repositories.IBranchRepository, OnlineBankSimulation.Application.Repositories.BranchRepository>();
            services.AddScoped<OnlineBank.Core.Interfaces.ITransactionService, OnlineBank.Core.Services.TransactionService>();
            services.AddScoped<OnlineBank.Core.Repository.ITransactionRepository, OnlineBankSimulation.Application.Repositories.TransactionRepository>();
            services.AddScoped<OnlineBankSimulation.Application.Services.BusinessRulesService>();
            services.AddScoped<OnlineBank.Core.Interfaces.IPdfGenerator, OnlineBank.Core.Services.PdfGenerator>();
            services.AddScoped<OnlineBankSimulation.Application.Services.BusinessRulesEngine>();
            services.AddScoped<OnlineBank.Core.Interfaces.IBusinessRulesEngine, OnlineBankSimulation.Application.Services.BusinessRulesEngine>();
            services.AddScoped<OnlineBank.Core.Interfaces.IAnalyticsService, OnlineBankSimulation.Application.Services.AnalyticsService>();
            services.AddScoped<OnlineBankSimulation.Application.Services.IAccountTypeBusinessRulesService, OnlineBankSimulation.Application.Services.AccountTypeBusinessRulesService>();
            services.AddScoped<OnlineBankSimulation.Domain.Interfaces.IAccountTypeBusinessRulesService, OnlineBankSimulation.Application.Services.AccountTypeBusinessRulesService>();
            services.AddScoped<OnlineBankSimulation.Application.Services.IDocumentUploadService, OnlineBankSimulation.Application.Services.DocumentUploadService>();

            services.AddScoped<OnlineBank.Core.Interfaces.IAuthService, OnlineBank.API.Services.AuthService>();
            services.AddScoped<DatabaseSeeder>();
            services.AddSingleton<OnlineBank.Core.Interfaces.IPasswordResetService, OnlineBankSimulation.Application.Services.PasswordResetService>();

            return services;
        }
    }
}

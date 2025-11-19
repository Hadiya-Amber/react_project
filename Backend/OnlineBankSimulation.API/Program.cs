using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OnlineBank.API.Configurations;
using OnlineBank.API.Middlewares;
using OnlineBank.API.Services;
using OnlineBank.Core;
using OnlineBank.Core.Mappings;
using OnlineBank.Infrastructure;
using OnlineBankSimulation.Application;
using OnlineBankSimulation.Application.Data;
using OnlineBankSimulation.Application.Services;
using OnlineBank.Core.Validators;
using OnlineBank.Core.Repositories;
using FluentValidation;
using FluentValidation.AspNetCore;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<OnlineBankDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(UserProfile), typeof(CustomerProfile), typeof(AccountProfile), typeof(BranchProfile));
// DatabaseSeeder registered in ServiceConfiguration


// Add JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

// Add FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CustomerRegistrationValidator>();

// Add services
builder.Services.AddApplicationServices();
builder.Services.AddDataServices(builder.Configuration);

// Add background services (removed unused services)

// Add Serilog
builder.AddSerilogLogging();

// Add DI and Configurations
builder.Services.AddServiceConfigurations();
builder.Services.AddRepositoryConfigurations();
builder.Services.AddSwaggerConfiguration();
builder.Services.AddControllers();
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN";
    options.SuppressXFrameOptionsHeader = false;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                  "http://localhost:3000",
                  "https://localhost:3000",
                  "http://localhost:3001",
                  "https://localhost:3001",
                  "http://localhost:5173",
                  "https://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Run database seeder
using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
    await seeder.SeedAsync();
}

// Middlewares
app.UseGlobalExceptionMiddleware();
app.UseStatusCodeTransform();
app.UseRequestLogging();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles(); // Enable serving static files from wwwroot
app.UseCors("AllowFrontend");
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

try
{
    Log.Information("🚀 OnlineBank API started successfully");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "❌ Application failed to start");
}
finally
{
    Log.CloseAndFlush();
}

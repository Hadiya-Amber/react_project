using Serilog;

namespace OnlineBank.API.Configurations
{
    public static class LoggingConfiguration
    {
        public static void AddSerilogLogging(this WebApplicationBuilder builder)
        {
            var logDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Logs");

            Log.Logger = new LoggerConfiguration()
                .Enrich.FromLogContext()
                .WriteTo.Console()
                .WriteTo.File(
                    path: Path.Combine(logDirectory, "log-.txt"),
                    rollingInterval: RollingInterval.Day,
                    retainedFileCountLimit: 10,
                    outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}"
                )
                .CreateLogger();

            builder.Host.UseSerilog(Log.Logger);
        }
    }
}

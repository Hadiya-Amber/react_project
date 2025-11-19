using System.Diagnostics;

namespace OnlineBank.API.Middlewares
{
    public class ResponseTimeMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ResponseTimeMiddleware> _logger;

        public ResponseTimeMiddleware(RequestDelegate next, ILogger<ResponseTimeMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var stopwatch = Stopwatch.StartNew();
            
            await _next(context);
            
            stopwatch.Stop();
            var responseTime = stopwatch.ElapsedMilliseconds;
            
            context.Response.Headers.Add("X-Response-Time", $"{responseTime}ms");
            
            var correlationId = context.Items["CorrelationId"]?.ToString() ?? "N/A";
            _logger.LogInformation("Request {Method} {Path} completed in {ResponseTime}ms [CorrelationId: {CorrelationId}]",
                context.Request.Method,
                context.Request.Path,
                responseTime,
                correlationId);
        }
    }

    public static class ResponseTimeMiddlewareExtensions
    {
        public static IApplicationBuilder UseResponseTime(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<ResponseTimeMiddleware>();
        }
    }
}
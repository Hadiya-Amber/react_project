namespace OnlineBank.API.Middlewares
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var request = context.Request;
            var method = SanitizeLogValue(request.Method);
            var path = SanitizeLogValue(request.Path.Value ?? "");

            _logger.LogInformation("➡️ Incoming Request: {Method} {Path}", method, path);

            await _next(context);

            _logger.LogInformation("⬅️ Response Status: {StatusCode}", context.Response.StatusCode);
        }

        private static string SanitizeLogValue(string value)
        {
            if (string.IsNullOrEmpty(value))
                return value;
            
            // Remove potential log injection characters
            return value.Replace("\r", "").Replace("\n", "").Replace("\t", "");
        }
    }

    //Extension method for Program.cs
    public static class RequestLoggingMiddlewareExtensions
    {
        public static IApplicationBuilder UseRequestLogging(this IApplicationBuilder app)
        {
            return app.UseMiddleware<RequestLoggingMiddleware>();
        }
    }
}

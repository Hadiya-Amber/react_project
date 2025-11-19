namespace OnlineBank.API.Middlewares
{
    public class CorrelationMiddleware
    {
        private readonly RequestDelegate _next;
        private const string CorrelationIdHeader = "X-Correlation-ID";

        public CorrelationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var correlationId = GetOrGenerateCorrelationId(context);
            context.Items["CorrelationId"] = correlationId;
            context.Response.Headers.Add(CorrelationIdHeader, correlationId);

            await _next(context);
        }

        private static string GetOrGenerateCorrelationId(HttpContext context)
        {
            return context.Request.Headers[CorrelationIdHeader].FirstOrDefault() 
                   ?? Guid.NewGuid().ToString();
        }
    }

    public static class CorrelationMiddlewareExtensions
    {
        public static IApplicationBuilder UseCorrelationId(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<CorrelationMiddleware>();
        }
    }
}
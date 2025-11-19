using System.Text.Json;

namespace OnlineBank.API.Middlewares
{
    public class StatusCodeTransformMiddleware
    {
        private readonly RequestDelegate _next;

        public StatusCodeTransformMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var originalBodyStream = context.Response.Body;
            using var responseBody = new MemoryStream();
            context.Response.Body = responseBody;

            await _next(context);

            // Transform error status codes to 200
            if (context.Response.StatusCode >= 400)
            {
                var originalStatusCode = context.Response.StatusCode;
                context.Response.StatusCode = 200;

                responseBody.Seek(0, SeekOrigin.Begin);
                var responseContent = await new StreamReader(responseBody).ReadToEndAsync();

                // Try to parse existing response or create new error response
                object transformedResponse;
                try
                {
                    var existingResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
                    transformedResponse = new
                    {
                        success = false,
                        message = existingResponse.TryGetProperty("message", out var msg) ? msg.GetString() : GetDefaultErrorMessage(originalStatusCode),
                        data = (object?)null,
                        errors = existingResponse.TryGetProperty("errors", out var errors) ? errors : (object?)null,
                        originalStatus = originalStatusCode
                    };
                }
                catch
                {
                    transformedResponse = new
                    {
                        success = false,
                        message = GetDefaultErrorMessage(originalStatusCode),
                        data = (object?)null,
                        errors = (object?)null,
                        originalStatus = originalStatusCode
                    };
                }

                var newContent = JsonSerializer.Serialize(transformedResponse);
                context.Response.ContentLength = newContent.Length;
                context.Response.Body = originalBodyStream;
                await context.Response.WriteAsync(newContent);
            }
            else
            {
                responseBody.Seek(0, SeekOrigin.Begin);
                await responseBody.CopyToAsync(originalBodyStream);
            }
        }

        private static string GetDefaultErrorMessage(int statusCode)
        {
            return statusCode switch
            {
                400 => "Bad request. Please check your input.",
                401 => "Authentication required.",
                403 => "Access denied.",
                404 => "Resource not found.",
                409 => "Conflict occurred.",
                422 => "Validation failed.",
                500 => "Internal server error.",
                _ => "An error occurred."
            };
        }
    }

    public static class StatusCodeTransformMiddlewareExtensions
    {
        public static IApplicationBuilder UseStatusCodeTransform(this IApplicationBuilder app)
        {
            return app.UseMiddleware<StatusCodeTransformMiddleware>();
        }
    }
}
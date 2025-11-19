using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace OnlineBank.Api.Attributes
{
    public class ValidateAntiForgeryTokenAttribute : ActionFilterAttribute
    {
        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var antiforgery = context.HttpContext.RequestServices.GetRequiredService<IAntiforgery>();
            
            try
            {
                await antiforgery.ValidateRequestAsync(context.HttpContext);
                await next();
            }
            catch (AntiforgeryValidationException)
            {
                context.Result = new BadRequestObjectResult(new { error = "Invalid anti-forgery token" });
            }
        }
    }
}
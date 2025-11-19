using Microsoft.AspNetCore.Mvc;
using OnlineBank.Core.Common;
using OnlineBank.Core.Interfaces;

namespace OnlineBank.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatsController : ControllerBase
    {
        private readonly IStatsService _statsService;
        private readonly ILogger<StatsController> _logger;

        public StatsController(IStatsService statsService, ILogger<StatsController> logger)
        {
            _statsService = statsService;
            _logger = logger;
        }

        [HttpGet("bank-overview")]
        public async Task<IActionResult> GetBankOverview()
        {
            try
            {
                var result = await _statsService.GetBankOverviewAsync();
                if (!result.Success)
                    return BadRequest(ApiResponse<object>.FailResponse(result.Message));

                return Ok(ApiResponse<object>.SuccessResponse(result.Data, "Bank overview statistics retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving bank overview stats");
                return StatusCode(500, ApiResponse<object>.FailResponse("Failed to retrieve bank overview stats"));
            }
        }
    }
}
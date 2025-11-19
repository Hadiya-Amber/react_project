using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineBankSimulation.Application.Services;
using System.Security.Claims;

namespace OnlineBankSimulation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DocumentController : ControllerBase
    {
        private readonly IDocumentUploadService _documentService;
        private readonly ILogger<DocumentController> _logger;

        public DocumentController(IDocumentUploadService documentService, ILogger<DocumentController> logger)
        {
            _documentService = documentService;
            _logger = logger;
        }

        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadDocument([FromForm] UploadDocumentRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { success = false, message = "Invalid user token" });
                }

                if (request.File == null || string.IsNullOrEmpty(request.DocumentType))
                {
                    return BadRequest(new { success = false, message = "File and document type are required" });
                }

                var result = await _documentService.UploadDocumentAsync(request.File, userId, request.DocumentType);
                
                if (result.Success)
                {
                    return Ok(new 
                    { 
                        success = true, 
                        message = result.Message,
                        data = new
                        {
                            filePath = result.FilePath,
                            fileUrl = _documentService.GetDocumentUrl(result.FilePath),
                            documentType = request.DocumentType,
                            uploadedAt = DateTime.UtcNow
                        }
                    });
                }
                
                return BadRequest(new { success = false, message = result.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading document");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteDocument([FromQuery] string filePath)
        {
            try
            {
                if (string.IsNullOrEmpty(filePath))
                {
                    return BadRequest(new { success = false, message = "File path is required" });
                }

                var result = await _documentService.DeleteDocumentAsync(filePath);
                
                if (result)
                {
                    return Ok(new { success = true, message = "Document deleted successfully" });
                }
                
                return NotFound(new { success = false, message = "Document not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting document");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpGet("url")]
        public IActionResult GetDocumentUrl([FromQuery] string filePath)
        {
            try
            {
                if (string.IsNullOrEmpty(filePath))
                {
                    return BadRequest(new { success = false, message = "File path is required" });
                }

                var url = _documentService.GetDocumentUrl(filePath);
                return Ok(new { success = true, data = new { url } });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting document URL");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }
    }

    public class UploadDocumentRequest
    {
        public IFormFile File { get; set; } = null!;
        public string DocumentType { get; set; } = string.Empty;
    }
}
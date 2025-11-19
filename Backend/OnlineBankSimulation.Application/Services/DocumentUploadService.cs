using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace OnlineBankSimulation.Application.Services
{
    public interface IDocumentUploadService
    {
        Task<(bool Success, string Message, string? FilePath)> UploadDocumentAsync(IFormFile file, int userId, string documentType);
        Task<bool> DeleteDocumentAsync(string filePath);
        string GetDocumentUrl(string filePath);
    }

    public class DocumentUploadService : IDocumentUploadService
    {
        private readonly ILogger<DocumentUploadService> _logger;
        private readonly string _uploadsPath;
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx" };
        private readonly long _maxFileSize = 5 * 1024 * 1024; // 5MB

        public DocumentUploadService(ILogger<DocumentUploadService> logger)
        {
            _logger = logger;
            _uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "documents");
            
            // Ensure directory exists
            if (!Directory.Exists(_uploadsPath))
            {
                Directory.CreateDirectory(_uploadsPath);
            }
        }

        public async Task<(bool Success, string Message, string? FilePath)> UploadDocumentAsync(IFormFile file, int userId, string documentType)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return (false, "No file provided", null);

                if (file.Length > _maxFileSize)
                    return (false, "File size exceeds 5MB limit", null);

                // Sanitize filename to prevent path traversal
                var originalFileName = Path.GetFileName(file.FileName);
                if (string.IsNullOrWhiteSpace(originalFileName) || originalFileName.Contains(".."))
                    return (false, "Invalid filename", null);

                var extension = Path.GetExtension(originalFileName).ToLowerInvariant();
                if (!_allowedExtensions.Contains(extension))
                    return (false, "Invalid file type. Allowed: JPG, PNG, PDF, DOC, DOCX", null);

                // Sanitize document type
                var sanitizedDocType = documentType.Replace("..", "").Replace("/", "").Replace("\\", "");

                // Create user-specific directory
                var userDirectory = Path.Combine(_uploadsPath, userId.ToString());
                var fullUserDirectory = Path.GetFullPath(userDirectory);
                var fullUploadsPath = Path.GetFullPath(_uploadsPath);
                
                if (!fullUserDirectory.StartsWith(fullUploadsPath))
                    return (false, "Invalid directory path", null);
                
                if (!Directory.Exists(userDirectory))
                {
                    Directory.CreateDirectory(userDirectory);
                }

                // Generate unique filename
                var fileName = $"{sanitizedDocType}_{DateTime.UtcNow:yyyyMMdd_HHmmss}_{Guid.NewGuid().ToString("N")[..8]}{extension}";
                var filePath = Path.Combine(userDirectory, fileName);
                
                // Final path validation
                var fullFilePath = Path.GetFullPath(filePath);
                if (!fullFilePath.StartsWith(fullUploadsPath))
                    return (false, "Invalid file path", null);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Return relative path for database storage
                var relativePath = Path.Combine("uploads", "documents", userId.ToString(), fileName).Replace("\\", "/");
                
                _logger.LogInformation("Document uploaded successfully: {FilePath} for user {UserId}", relativePath, userId);
                return (true, "Document uploaded successfully", relativePath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading document for user {UserId}", userId);
                return (false, "Failed to upload document", null);
            }
        }

        public async Task<bool> DeleteDocumentAsync(string filePath)
        {
            try
            {
                if (string.IsNullOrEmpty(filePath) || filePath.Contains(".."))
                    return false;

                var basePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var fullPath = Path.Combine(basePath, filePath.Replace("/", "\\"));
                
                // Validate path is within allowed directory
                var resolvedPath = Path.GetFullPath(fullPath);
                var resolvedBasePath = Path.GetFullPath(basePath);
                
                if (!resolvedPath.StartsWith(resolvedBasePath))
                {
                    _logger.LogWarning("Attempted path traversal attack: {FilePath}", filePath);
                    return false;
                }
                
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                    _logger.LogInformation("Document deleted: {FilePath}", filePath);
                    return true;
                }
                
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting document: {FilePath}", filePath);
                return false;
            }
        }

        public string GetDocumentUrl(string filePath)
        {
            if (string.IsNullOrEmpty(filePath))
                return string.Empty;
            
            return $"/{filePath}";
        }
    }
}
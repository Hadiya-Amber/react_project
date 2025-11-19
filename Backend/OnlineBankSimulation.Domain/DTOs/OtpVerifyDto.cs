using OnlineBank.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace OnlineBank.Core.DTOs
{
    public class OtpVerifyDto
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "OTP code is required")]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "OTP must be 6 digits")]
        [RegularExpression(@"^\d{6}$", ErrorMessage = "OTP must contain only digits")]
        public string OtpCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Purpose is required")]
        public OtpPurpose Purpose { get; set; }
    }
}
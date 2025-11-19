using OnlineBank.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace OnlineBank.Core.DTOs
{
    public class OtpRequestDto
    {
        public int UserId { get; set; } = 0;
        
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Purpose is required")]
        public OtpPurpose Purpose { get; set; }
    }
}
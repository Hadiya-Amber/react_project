using System.ComponentModel.DataAnnotations;

namespace OnlineBank.Core.DTOs.UserDtos
{
    public class AdminPasswordChangeDto
    {
        [Required, MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;
    }
}
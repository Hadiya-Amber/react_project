using System.ComponentModel.DataAnnotations;

namespace OnlineBank.Core.DTOs.AccountDtos
{
    public class VerifyAccountDto
    {
        [Required]
        public bool IsApproved { get; set; }
        
        public string? Remarks { get; set; }
    }
}
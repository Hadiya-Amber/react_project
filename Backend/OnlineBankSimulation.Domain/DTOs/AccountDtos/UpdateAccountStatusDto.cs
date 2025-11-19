using System.ComponentModel.DataAnnotations;

namespace OnlineBank.Core.DTOs.AccountDtos
{
    public class UpdateAccountStatusDto
    {
        [Required]
        public int AccountId { get; set; }

        [Required]
        public int Status { get; set; }
    }
}
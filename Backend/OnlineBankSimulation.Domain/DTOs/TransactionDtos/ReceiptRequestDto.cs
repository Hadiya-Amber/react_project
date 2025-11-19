using System.ComponentModel.DataAnnotations;

namespace OnlineBank.Core.DTOs.TransactionDtos
{
    public class ReceiptRequestDto
    {
        [Required]
        public int TransactionId { get; set; }
    }
}
using OnlineBank.Core.Enums;

namespace OnlineBank.Core.DTOs.TransactionDtos
{
    public class TransactionCreateDto
    {
        public int FromAccountId { get; set; }
        public int? ToAccountId { get; set; }
        public decimal Amount { get; set; }
        public TransactionType TransactionType { get; set; }
        public string? Description { get; set; }
        public string? Reference { get; set; }
    }
}
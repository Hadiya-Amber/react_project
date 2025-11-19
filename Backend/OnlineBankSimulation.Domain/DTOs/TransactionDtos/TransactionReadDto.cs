using OnlineBank.Core.Enums;

namespace OnlineBank.Core.DTOs.TransactionDtos
{
    public class TransactionReadDto
    {
        public int Id { get; set; }
        public string TransactionId { get; set; } = string.Empty;
        public string? TransactionReference { get; set; }
        public int FromAccountId { get; set; }
        public string FromAccountNumber { get; set; } = string.Empty;
        public int? ToAccountId { get; set; }
        public string? ToAccountNumber { get; set; }
        public decimal Amount { get; set; }
        public TransactionType TransactionType { get; set; }
        public TransactionStatus Status { get; set; }
        public string? Description { get; set; }
        public string? Reference { get; set; }
        public DateTime TransactionDate { get; set; }
        public string? ReceiptPath { get; set; }
    }
}
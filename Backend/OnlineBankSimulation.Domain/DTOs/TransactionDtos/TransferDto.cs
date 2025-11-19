namespace OnlineBank.Core.DTOs.TransactionDtos
{
    public class TransferDto
    {
        public string FromAccountNumber { get; set; } = string.Empty;
        public string ToAccountNumber { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public string? Reference { get; set; }
    }
}
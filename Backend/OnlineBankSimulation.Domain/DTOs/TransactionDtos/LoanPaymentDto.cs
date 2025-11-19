namespace OnlineBank.Core.DTOs.TransactionDtos
{
    public class LoanPaymentDto
    {
        public int FromAccountId { get; set; }
        public decimal Amount { get; set; }
        public string LoanAccountNumber { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
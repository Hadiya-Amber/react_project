using OnlineBank.Core.Enums;

namespace OnlineBank.Core.DTOs.TransactionDtos
{
    public class WithdrawalDto
    {
        public string FromAccountNumber { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public string? Pin { get; set; }
        public WithdrawalMode WithdrawalMode { get; set; } = WithdrawalMode.BankCounter;
        public int BranchId { get; set; }
        public string? ReferenceNumber { get; set; }
    }
}
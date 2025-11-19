namespace OnlineBank.Core.DTOs.TransactionDtos
{
    public class InvestmentDepositDto
    {
        public int FromAccountId { get; set; }
        public decimal Amount { get; set; }
        public string InvestmentType { get; set; } = string.Empty;
        public bool IsGirlChildInvestment { get; set; } = false;
        public string? Description { get; set; }
    }
}
namespace OnlineBank.Core.DTOs.AnalyticsDtos
{
    public class AccountTypeAnalyticsDto
    {
        public string AccountType { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal TotalBalance { get; set; }
        public decimal Percentage { get; set; }
    }
}
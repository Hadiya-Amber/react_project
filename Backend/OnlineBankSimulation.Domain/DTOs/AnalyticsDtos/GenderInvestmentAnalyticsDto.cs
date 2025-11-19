namespace OnlineBank.Core.DTOs.AnalyticsDtos
{
    public class GenderInvestmentAnalyticsDto
    {
        public string Gender { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal TotalInvestment { get; set; }
        public decimal AverageInvestment { get; set; }
        public decimal Percentage { get; set; }
    }
}
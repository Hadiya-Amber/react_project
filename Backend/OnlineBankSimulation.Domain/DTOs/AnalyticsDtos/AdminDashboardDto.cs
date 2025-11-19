namespace OnlineBank.Core.DTOs.AnalyticsDtos
{
    public class AdminDashboardDto
    {
        public OverviewStatsDto OverviewStats { get; set; } = new();
        public List<BranchPerformanceDto> BranchPerformance { get; set; } = new();
        public List<TransactionTrendDto> TransactionTrends { get; set; } = new();
        public List<AccountTypeDistributionDto> AccountTypeDistribution { get; set; } = new();
        public List<RecentActivityDto> RecentActivities { get; set; } = new();
    }

    public class OverviewStatsDto
    {
        public int TotalBranches { get; set; }
        public int TotalCustomers { get; set; }
        public int TotalAccounts { get; set; }
        public int PendingAccounts { get; set; }
        public decimal TotalDeposits { get; set; }
        public int TotalTransactions { get; set; }
        public int PendingTransactions { get; set; }
        public decimal MonthlyTransactionVolume { get; set; }
    }

    public class BranchPerformanceDto
    {
        public int BranchId { get; set; }
        public string BranchName { get; set; } = string.Empty;
        public string BranchCode { get; set; } = string.Empty;
        public int TotalAccounts { get; set; }
        public int ActiveAccounts { get; set; }
        public decimal TotalDeposits { get; set; }
        public int TransactionsThisMonth { get; set; }
        public decimal TransactionVolumeThisMonth { get; set; }
    }

    public class TransactionTrendDto
    {
        public DateTime Date { get; set; }
        public int TransactionCount { get; set; }
        public decimal TransactionVolume { get; set; }
        public int DepositCount { get; set; }
        public int WithdrawalCount { get; set; }
        public int TransferCount { get; set; }
    }

    public class AccountTypeDistributionDto
    {
        public string AccountType { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Percentage { get; set; }
        public decimal TotalBalance { get; set; }
    }

    public class RecentActivityDto
    {
        public string ActivityType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string? UserName { get; set; }
        public string? BranchName { get; set; }
        public decimal? Amount { get; set; }
    }
}
using OnlineBank.Core.Enums;

namespace OnlineBank.Core.DTOs.TransactionDtos
{
    public class UserTransactionHistoryDto
    {
        public List<TransactionDetailDto> Transactions { get; set; } = new();
        public decimal CurrentBalance { get; set; }
        public decimal TotalCredits { get; set; }
        public decimal TotalDebits { get; set; }
        public int TotalTransactions { get; set; }
        public DateTime? LastTransactionDate { get; set; }
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountHolderName { get; set; } = string.Empty;
    }

    public class DashboardTransactionSummary
    {
        // Recent Transactions (last 5-10)
        public List<TransactionDetailDto> RecentTransactions { get; set; } = new();
        
        // Quick Stats
        public decimal TodayCredits { get; set; }
        public decimal TodayDebits { get; set; }
        public int TodayTransactionCount { get; set; }
        
        public decimal WeekCredits { get; set; }
        public decimal WeekDebits { get; set; }
        public int WeekTransactionCount { get; set; }
        
        public decimal MonthCredits { get; set; }
        public decimal MonthDebits { get; set; }
        public int MonthTransactionCount { get; set; }
        
        // Pending Transactions
        public List<TransactionDetailDto> PendingTransactions { get; set; } = new();
        public int PendingCount { get; set; }
        
        // Account Balance
        public decimal CurrentBalance { get; set; }
        public decimal AvailableBalance { get; set; }
    }
}
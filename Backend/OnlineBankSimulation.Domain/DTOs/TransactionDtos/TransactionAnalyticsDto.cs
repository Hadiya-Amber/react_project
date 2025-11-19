using OnlineBank.Core.Enums;

namespace OnlineBank.Core.DTOs.TransactionDtos
{
    public class TransactionAnalyticsDto
    {
        public decimal TotalDeposits { get; set; }
        public decimal TotalWithdrawals { get; set; }
        public decimal TotalTransfers { get; set; }
        public int TransactionCount { get; set; }
        public DateTime AnalysisDate { get; set; }
        public TransactionType TransactionType { get; set; }
    }

    public class CustomerBalanceDto
    {
        public int UserId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public AccountType AccountType { get; set; }
    }

    public class DashboardAnalyticsDto
    {
        public decimal TotalDepositsToday { get; set; }
        public decimal TotalWithdrawalsToday { get; set; }
        public decimal TotalDepositsThisWeek { get; set; }
        public decimal TotalWithdrawalsThisWeek { get; set; }
        public decimal TotalDepositsThisMonth { get; set; }
        public decimal TotalWithdrawalsThisMonth { get; set; }
        public int PendingTransactionCount { get; set; }
        public int ApprovedTransactionCount { get; set; }
        public int RejectedTransactionCount { get; set; }
        public decimal PendingTransactionPercentage { get; set; }
        public decimal ApprovedTransactionPercentage { get; set; }
    }

    public class TransactionTypeAnalyticsDto
    {
        public TransactionType Type { get; set; }
        public int Count { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal Percentage { get; set; }
    }

    public class CustomerVolumeDto
    {
        public int UserId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public int TransactionCount { get; set; }
        public decimal TotalVolume { get; set; }
        public AccountType AccountType { get; set; }
    }

    public class CustomerFinancialSummaryDto
    {
        public decimal TotalIncome { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetSavings { get; set; }
        public decimal CurrentBalance { get; set; }
        public int TotalTransactions { get; set; }
        public decimal AverageMonthlyIncome { get; set; }
        public decimal AverageMonthlyExpenses { get; set; }
    }

    public class CustomerMonthlyTrendDto
    {
        public string Month { get; set; } = string.Empty;
        public int Year { get; set; }
        public decimal Income { get; set; }
        public decimal Expenses { get; set; }
        public decimal NetFlow { get; set; }
        public int TransactionCount { get; set; }
    }

    public class CustomerExpenseCategoryDto
    {
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int TransactionCount { get; set; }
        public decimal Percentage { get; set; }
    }
}
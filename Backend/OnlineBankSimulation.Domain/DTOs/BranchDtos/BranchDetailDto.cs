using OnlineBank.Core.Enums;

namespace OnlineBank.Core.DTOs.BranchDtos
{
    public class BranchDetailDto
    {
        public int Id { get; set; }
        public string BranchCode { get; set; } = string.Empty;
        public string BranchName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string IFSCCode { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string? PostalCode { get; set; }
        public BranchType BranchType { get; set; }
        public bool IsMainBranch { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        // Branch Manager Details
        public BranchManagerDto? BranchManager { get; set; }

        // Branch Statistics
        public BranchStatisticsDto Statistics { get; set; } = new();

        // Recent Activities
        public List<BranchActivityDto> RecentActivities { get; set; } = new();
    }

    public class BranchManagerDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? Designation { get; set; }
        public string? EmployeeCode { get; set; }
        public DateTime? JoinDate { get; set; }
        public UserStatus Status { get; set; }
        public bool IsActive { get; set; }
        public DateTime? LastLoginDate { get; set; }
    }

    public class BranchStatisticsDto
    {
        public int TotalAccounts { get; set; }
        public int ActiveAccounts { get; set; }
        public int PendingAccounts { get; set; }
        public decimal TotalDeposits { get; set; }
        public int TotalCustomers { get; set; }
        public int PendingTransactions { get; set; }
        public decimal MonthlyTransactionVolume { get; set; }
        public int TransactionsThisMonth { get; set; }
    }

    public class BranchActivityDto
    {
        public string ActivityType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string? UserName { get; set; }
        public string? AccountNumber { get; set; }
        public decimal? Amount { get; set; }
    }
}
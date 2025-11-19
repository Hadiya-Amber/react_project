namespace OnlineBank.Core.Constants
{
    public static class BusinessRuleConstants
    {
        // Transaction Limits
        public const decimal HighValueTransactionLimit = 100000m;
        public const decimal DailyTransactionLimit = 500000m;
        public const decimal MinorAccountLimit = 50000m;
        public const decimal MinTransactionAmount = 0.01m;
        public const decimal MaxTransactionAmount = 1000000m;
        
        // Age Limits
        public const int MinimumAge = 18;
        public const int MinorAge = 18;
        
        // Approval Levels
        public const string TellerLevel = "Teller";
        public const string ManagerLevel = "Manager";
        public const string AdminLevel = "Admin";
        
        // Account Status Transitions
        public const int DormantAccountDays = 365;
        public const int InactiveAccountDays = 180;
        
        // Transaction Fees
        public const decimal TransferFeeThreshold = 10000m;
        public const decimal WithdrawalFeeThreshold = 5000m;
        public const decimal StandardTransferFee = 10m;
        public const decimal StandardWithdrawalFee = 5m;
    }
}
namespace OnlineBank.Core.Constants
{
    public static class TransactionMessages
    {
        public const string TransactionCreated = "Transaction completed successfully.";
        public const string TransactionNotFound = "Transaction not found.";
        public const string TransactionsFetched = "Transactions fetched successfully.";
        public const string TransactionFetched = "Transaction details retrieved.";
        public const string NoTransactionsFound = "No transactions found.";
        public const string TransactionDeleted = "Transaction deleted successfully.";
        public const string AccountNotFound = "Account not found.";
        public const string InsufficientBalance = "Insufficient balance in the source account.";
        public const string UnexpectedError = "An unexpected error occurred while processing the transaction.";
        public const string PdfGenerated = "Transaction statement PDF generated successfully.";
        public const string PdfGenerationFailed = "Failed to generate transaction statement PDF.";
        
        // Transaction Flow Messages
        public const string DepositSuccessful = "Deposit completed successfully.";
        public const string WithdrawalSuccessful = "Withdrawal completed successfully.";
        public const string TransferSuccessful = "Transfer completed successfully.";
        public const string PaymentSuccessful = "Payment completed successfully.";
        public const string TransactionPending = "Transaction submitted and pending approval.";
        public const string TransactionApproved = "Transaction has been approved and processed.";
        public const string TransactionRejected = "Transaction has been rejected.";
        public const string InvalidAmount = "Transaction amount must be greater than zero.";
        public const string ExceedsLimit = "Transaction amount exceeds daily limit.";
        public const string AccountInactive = "Account is inactive and cannot process transactions.";
        public const string SameAccountTransfer = "Cannot transfer to the same account.";
        public const string TransactionNotPending = "Transaction is not in pending status for approval.";
        public const string UnauthorizedTransaction = "You don't have permission to access this transaction.";
        
        // Business Rule Messages
        public const string AccountDormant = "Account is dormant. Limited transactions allowed.";
        public const string ExceedsMonthlyLimit = "Transaction exceeds monthly limit.";
        public const string BranchClosed = "Branch is currently closed. Please try during working hours.";
        public const string ExceedsBranchLimit = "Transaction exceeds branch daily limit.";
        public const string AccountTypeRestriction = "This transaction type is not allowed for your account type.";
        
        // Enhanced Transaction Messages
        public const string BillPaymentSuccessful = "Bill payment completed successfully.";
        public const string LoanPaymentSuccessful = "Loan payment completed successfully.";
        public const string InvestmentDepositSuccessful = "Investment deposit completed successfully.";
        public const string TransactionReversed = "Transaction has been reversed successfully.";
        public const string MinorAccountLimitExceeded = "Transaction exceeds minor account limits.";
        public const string GirlChildInvestmentOnly = "Girl Child Investment is only available for eligible female minor accounts.";
        public const string MultiLevelApprovalRequired = "Transaction requires multi-level approval.";
        public const string EmployeeApprovalRequired = "Transaction requires employee approval first.";
        public const string ManagerApprovalRequired = "Transaction requires manager approval.";
        public const string AdminApprovalRequired = "Transaction requires admin approval for high amounts.";
        public const string InvalidStatusTransition = "Invalid account status transition.";
        public const string AccountTransitionedToMajor = "Account successfully transitioned from Minor to Major.";
        public const string GuardianApprovalRequired = "Guardian approval required for minor account transactions.";
    }
}

namespace OnlineBank.Core.Constants
{
    public static class AccountMessages
    {
        public const string AccountNotFound = "Account not found.";
        public const string AccountCreated = "Bank account created successfully.";
        public const string AccountUpdated = "Account details updated successfully.";
        public const string AccountDeleted = "Account closed successfully.";
        public const string InsufficientBalance = "Insufficient balance for this transaction.";
        public const string AccountInactive = "This account is currently inactive.";
        public const string DuplicateAccountNumber = "An account with this number already exists.";

        public const string AccountDormant = "Account is dormant due to inactivity.";
        public const string UnexpectedError = "An unexpected error occurred while processing the account.";
        
        // Verification Flow Messages
        public const string AccountPending = "Your account application has been received and is pending verification.";
        public const string AccountApproved = "Account has been successfully approved and activated.";
        public const string AccountApprovedCustomerEmail = "Congratulations! Your account has been approved and is now active. You can now apply for debit/credit cards and start banking with us.";
        public const string AccountRejected = "Your account application was rejected due to incomplete verification.";
        public const string AccountVerified = "Account verified successfully.";
        public const string AccountNotPending = "Account is not in pending status for verification.";
        public const string DocumentsUploaded = "Documents uploaded successfully.";
        public const string InvalidAccountStatus = "Invalid account status for this operation.";
        public const string DuplicateAccountType = "You already have an account of this type. Only one Major/Minor/Current account is allowed per customer.";
        public const string AccountActivated = "Account has been activated successfully.";
        public const string AccountDeactivated = "Account has been deactivated successfully.";
    }
}
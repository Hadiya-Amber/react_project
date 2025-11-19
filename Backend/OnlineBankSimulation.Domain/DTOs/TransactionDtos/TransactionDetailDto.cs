using OnlineBank.Core.Enums;

namespace OnlineBank.Core.DTOs.TransactionDtos
{
    public class TransactionDetailDto
    {
        public int Id { get; set; }
        public string TransactionId { get; set; } = string.Empty;
        public string? TransactionReference { get; set; }
        
        // Account Information
        public int FromAccountId { get; set; }
        public string FromAccountNumber { get; set; } = string.Empty;
        public string FromAccountHolderName { get; set; } = string.Empty;
        public int? ToAccountId { get; set; }
        public string? ToAccountNumber { get; set; }
        public string? ToAccountHolderName { get; set; }
        
        // Transaction Details
        public decimal Amount { get; set; }
        public TransactionType TransactionType { get; set; }
        public TransactionStatus Status { get; set; }
        public string? Description { get; set; }
        public string? Reference { get; set; }
        public DateTime TransactionDate { get; set; }
        
        // User Perspective Fields
        public TransactionDirection Direction { get; set; } // Credit/Debit from user's perspective
        public string DisplayDescription { get; set; } = string.Empty;
        public string OtherPartyName { get; set; } = string.Empty;
        public string OtherPartyAccount { get; set; } = string.Empty;
        
        // Balance Information
        public decimal? BalanceAfterTransaction { get; set; }
        
        // Additional Information
        public string? BranchName { get; set; }
        public string? ProcessedBy { get; set; }
        public DateTime? ProcessedDate { get; set; }
        public string? Remarks { get; set; }
    }

    public enum TransactionDirection
    {
        Credit = 0,  // Money coming in (deposits, incoming transfers)
        Debit = 1    // Money going out (withdrawals, outgoing transfers)
    }
}
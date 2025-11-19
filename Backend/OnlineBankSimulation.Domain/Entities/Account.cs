using Microsoft.EntityFrameworkCore;
using OnlineBank.Core.Common;
using OnlineBank.Core.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBank.Core.Models
{
    [Table("Accounts")]
    [Index(nameof(AccountNumber), IsUnique = true)]
    public class Account : BaseEntity
    {
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public int BranchId { get; set; }

        [Required, StringLength(20, MinimumLength = 8)]
        [RegularExpression(@"^[A-Za-z0-9]+$")]
        public string AccountNumber { get; set; } = string.Empty;

        [Required]
        public AccountType Type { get; set; }

        [Required, Range(0, 999999999999.99)]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Balance { get; set; }

        [Required]
        public DateTime OpenedDate { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        public DateTime? LastTransactionDate { get; set; }
        
        [Required]
        public AccountStatus Status { get; set; } = AccountStatus.Pending;

        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; } = null!;
        
        [ForeignKey(nameof(BranchId))]
        public virtual Branch Branch { get; set; } = null!;

        [InverseProperty(nameof(Transaction.FromAccount))]
        public virtual ICollection<Transaction> OutgoingTransactions { get; set; } = new List<Transaction>();

        [InverseProperty(nameof(Transaction.ToAccount))]
        public virtual ICollection<Transaction> IncomingTransactions { get; set; } = new List<Transaction>();
    }
}

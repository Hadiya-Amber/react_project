using Microsoft.EntityFrameworkCore;
using OnlineBank.Core.Common;
using OnlineBank.Core.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBank.Core.Models
{
    [Table("Transactions")]
    [Index(nameof(FromAccountId))]
    [Index(nameof(ToAccountId))]
    [Index(nameof(TransactionDate))]
    [Index(nameof(TransactionType))]
    public class Transaction : BaseEntity
    {
        public int? FromAccountId { get; set; }

        public int? ToAccountId { get; set; }

        [Required, Range(0.01, 999999999999.99)]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        public TransactionType TransactionType { get; set; }

        [Required]
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

        [StringLength(500)]
        public string? Description { get; set; }

        [StringLength(500)]
        public string? ReceiptPath { get; set; }

        [Required, StringLength(50)]
        public string TransactionReference { get; set; } = string.Empty;

        [Required]
        public TransactionStatus Status { get; set; } = TransactionStatus.Pending;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal BalanceAfterTransaction { get; set; }

        [ForeignKey(nameof(FromAccountId))]
        public virtual Account? FromAccount { get; set; }

        [ForeignKey(nameof(ToAccountId))]
        public virtual Account? ToAccount { get; set; }
    }
}

using OnlineBank.Core.Enums;
using OnlineBank.Core.Common;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBank.Core.Models
{
    [Table("OtpVerifications")]
    public class OtpVerification : BaseEntity
    {
        public int? UserId { get; set; }
        
        [Required, EmailAddress, StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required, StringLength(6)]
        public string OtpCode { get; set; } = string.Empty;

        [Required]
        public OtpPurpose Purpose { get; set; }

        [Required]
        public DateTime ExpiresAt { get; set; }

        public bool IsUsed { get; set; } = false;

        public DateTime? UsedAt { get; set; }

        public int AttemptCount { get; set; } = 0;
        
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
    }
}
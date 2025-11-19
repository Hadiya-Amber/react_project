using Microsoft.EntityFrameworkCore;
using OnlineBank.Core.Common;
using OnlineBank.Core.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBank.Core.Models
{
    [Table("Users")]
    [Index(nameof(Email), IsUnique = true)]
    [Index(nameof(PhoneNumber), IsUnique = true)]
    public class User : BaseEntity
    {
        [Required, StringLength(100, MinimumLength = 2)]
        public string FullName { get; set; } = string.Empty;

        [Required, EmailAddress, StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required, StringLength(15, MinimumLength = 10)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required, StringLength(255, MinimumLength = 6)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public UserRole Role { get; set; } = UserRole.Customer;

        [StringLength(200)]
        public string? Address { get; set; }

        [Required, DataType(DataType.Date)]
        public DateTime DateOfBirth { get; set; }
        
        [Required]
        public Gender Gender { get; set; }

        [Required]
        public UserStatus Status { get; set; } = UserStatus.Pending;

        public bool IsActive { get; set; } = true;
        public bool IsEmailVerified { get; set; } = false;
        
        [StringLength(20)]
        public string? EmployeeCode { get; set; }
        
        public int? BranchId { get; set; }

        [ForeignKey(nameof(BranchId))]
        public virtual Branch? Branch { get; set; }
        
        [InverseProperty(nameof(Account.User))]
        public virtual ICollection<Account> Accounts { get; set; } = new List<Account>();
        
        [InverseProperty(nameof(OtpVerification.User))]
        public virtual ICollection<OtpVerification> OtpVerifications { get; set; } = new List<OtpVerification>();
    }
}

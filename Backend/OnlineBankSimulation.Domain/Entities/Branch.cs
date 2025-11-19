using Microsoft.EntityFrameworkCore;
using OnlineBank.Core.Common;
using OnlineBank.Core.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineBank.Core.Models
{
    [Table("Branches")]
    [Index(nameof(BranchCode), IsUnique = true)]
    [Index(nameof(IFSCCode), IsUnique = true)]
    public class Branch : BaseEntity
    {
        [Required, StringLength(10)]
        public string BranchCode { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string BranchName { get; set; } = string.Empty;

        [Required, StringLength(500)]
        public string Address { get; set; } = string.Empty;

        [Required, StringLength(50)]
        public string City { get; set; } = string.Empty;

        [Required, StringLength(50)]
        public string State { get; set; } = string.Empty;

        [Required, StringLength(11)]
        public string IFSCCode { get; set; } = string.Empty;

        [StringLength(100)]
        public string? ManagerName { get; set; }

        [Phone, StringLength(15)]
        public string? PhoneNumber { get; set; }

        [EmailAddress, StringLength(100)]
        public string? Email { get; set; }

        [StringLength(10)]
        public string? PostalCode { get; set; }

        [Required]
        public BranchType BranchType { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsMainBranch { get; set; } = false;

        [InverseProperty(nameof(Account.Branch))]
        public virtual ICollection<Account> Accounts { get; set; } = new List<Account>();

        [InverseProperty(nameof(User.Branch))]
        public virtual ICollection<User> Users { get; set; } = new List<User>();
    }
}
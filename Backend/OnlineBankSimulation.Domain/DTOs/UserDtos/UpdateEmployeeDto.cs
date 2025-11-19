using System.ComponentModel.DataAnnotations;
using OnlineBank.Core.Enums;

namespace OnlineBank.Core.DTOs.UserDtos
{
    public class UpdateEmployeeDto
    {
        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Phone]
        public string PhoneNumber { get; set; } = string.Empty;

        public string? Address { get; set; }

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required]
        public Gender Gender { get; set; }

        [Required]
        public int BranchId { get; set; }

        public string? Designation { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
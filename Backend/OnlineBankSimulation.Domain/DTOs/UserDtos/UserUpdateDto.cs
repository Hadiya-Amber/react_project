using System;
using System.ComponentModel.DataAnnotations;
using OnlineBank.Core.Enums;

namespace OnlineBank.Core.DTOs.UserDtos
{
    public class UserUpdateDto
    {
        [Required, StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Phone]
        public string? PhoneNumber { get; set; }

        public string? Address { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public Gender Gender { get; set; }

        public bool IsVerified { get; set; }
        public bool IsActive { get; set; }
    }
}

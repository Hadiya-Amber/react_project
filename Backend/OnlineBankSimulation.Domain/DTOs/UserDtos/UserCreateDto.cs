using System;
using System.ComponentModel.DataAnnotations;
using OnlineBank.Core.Enums;

namespace OnlineBank.Core.DTOs.UserDtos
{
    public class UserCreateDto
    {
        [Required, StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Phone]
        public string? PhoneNumber { get; set; }

        public string? Address { get; set; }

        public DateTime? DateOfBirth { get; set; }

        [Required]
        public Gender Gender { get; set; }

        [Required]
        public UserRole Role { get; set; } = UserRole.Customer;
    }
}

using OnlineBank.Core.Enums;

namespace OnlineBank.Core.DTOs.UserDtos
{
    public class UserResponseDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public UserRole Role { get; set; }
        public UserStatus Status { get; set; }
        public int? BranchId { get; set; }
        public string? EmployeeCode { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? TempPassword { get; set; }
        public string? BranchName { get; set; }
        public int Age { get; set; }
    }
}
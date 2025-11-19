using OnlineBank.Core.Enums;

namespace OnlineBank.Core.DTOs.UserDtos
{
    public class CreateEmployeeDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public UserRole Role { get; set; }
        public int BranchId { get; set; }
        public Gender Gender { get; set; }
    }
}
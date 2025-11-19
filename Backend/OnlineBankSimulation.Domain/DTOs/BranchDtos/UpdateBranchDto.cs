using OnlineBank.Core.Enums;

namespace OnlineBank.Core.DTOs.BranchDtos
{
    public class UpdateBranchDto
    {
        public string? BranchName { get; set; }
        public string? BranchCode { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? IFSCCode { get; set; }
        public string? PostalCode { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public BranchType? BranchType { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsMainBranch { get; set; }
    }
}
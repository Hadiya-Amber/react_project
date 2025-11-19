using OnlineBank.Core.Enums;

namespace OnlineBank.Core.DTOs.BranchDtos
{
    public class CreateBranchDto
    {
        public string BranchName { get; set; } = string.Empty;
        public string BranchCode { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string IFSCCode { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public BranchType BranchType { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsMainBranch { get; set; }
    }
}
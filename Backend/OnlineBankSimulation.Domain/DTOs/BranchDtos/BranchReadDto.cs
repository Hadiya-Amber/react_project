namespace OnlineBank.Core.DTOs.BranchDtos
{
    public class BranchReadDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string IFSCCode { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string? PostalCode { get; set; }
        public string BranchType { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsMainBranch { get; set; }
    }
}
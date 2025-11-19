using OnlineBank.Core.Enums;

namespace OnlineBank.Core.DTOs.AccountDtos
{
    public class AccountReadDto
    {
        public int Id { get; set; }
        public string AccountNumber { get; set; } = string.Empty;
        public AccountType AccountType { get; set; }
        public decimal Balance { get; set; }
        public bool IsDormant { get; set; }
        public DateTime OpenedDate { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public int BranchId { get; set; }
        public string BranchName { get; set; } = string.Empty;
        public AccountStatus Status { get; set; }
        public bool IsActive { get; set; }
    }
}
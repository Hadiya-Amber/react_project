using OnlineBank.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace OnlineBank.Core.DTOs.TransactionDtos
{
    public class DepositDto
    {
        [Required]
        public string ToAccountNumber { get; set; } = string.Empty;
        
        [Required]
        public decimal Amount { get; set; }
        
        [Required]
        public DepositMode DepositMode { get; set; }
        
        public string? ReferenceNumber { get; set; }
        public int? BranchId { get; set; }
        public string? DepositorName { get; set; }
        public string? Description { get; set; }
        public string? OtpCode { get; set; }
    }
}
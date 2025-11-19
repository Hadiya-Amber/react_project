using Microsoft.AspNetCore.Http;
using OnlineBank.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace OnlineBank.Core.DTOs.AccountDtos
{
    public class CreateAccountDto
    {
        [Required]
        public AccountType AccountType { get; set; }
        
        [Required, Range(100, double.MaxValue)]
        public double InitialDeposit { get; set; }
        
        [Required, StringLength(200)]
        public string Purpose { get; set; } = string.Empty;
        
        [Required]
        public int BranchId { get; set; }
        
        [Required, StringLength(200)]
        public string AddressLine1 { get; set; } = string.Empty;
        public string? AddressLine2 { get; set; }
        [Required] public string City { get; set; } = string.Empty;
        [Required] public string State { get; set; } = string.Empty;
        [Required] public string PostalCode { get; set; } = string.Empty;
        [Required] public string Country { get; set; } = string.Empty;
        
        [Required] public string Occupation { get; set; } = string.Empty;
        public double? MonthlyIncome { get; set; }
        
        [Required] public string EmergencyContactName { get; set; } = string.Empty;
        [Required, Phone] public string EmergencyContactPhone { get; set; } = string.Empty;
        [Phone] public string? AlternateContactPhone { get; set; }
        
        [Required] public IFormFile IdProofDocument { get; set; } = null!;
        [Required] public string IdProofType { get; set; } = string.Empty;
        [Required] public string IdProofNumber { get; set; } = string.Empty;
        
        public IFormFile? IncomeProofDocument { get; set; }
        
        [Required] public bool TermsAndConditionsAccepted { get; set; }
        [Required] public bool PrivacyPolicyAccepted { get; set; }
        [Required] public bool AntiMoneyLaunderingConsent { get; set; }
    }
}
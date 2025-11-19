using Microsoft.AspNetCore.Http;
using OnlineBank.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace OnlineBank.Core.DTOs.AccountDtos
{
    public class AccountCreateDto
    {
        // Basic Account Info
        [Required]
        public AccountType AccountType { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "Initial deposit must be non-negative")]
        public decimal InitialDeposit { get; set; } = 0;
        
        [Required]
        [StringLength(200)]
        public string Purpose { get; set; } = string.Empty;

        // Branch Selection (Required in real banking)
        [Required]
        public int BranchId { get; set; }

        // Complete Address Information (Banking Requirement)
        [Required]
        [StringLength(200)]
        public string AddressLine1 { get; set; } = string.Empty;
        
        [StringLength(200)]
        public string? AddressLine2 { get; set; }
        
        [Required]
        [StringLength(100)]
        public string City { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string State { get; set; } = string.Empty;
        
        [Required]
        [StringLength(20)]
        public string PostalCode { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string Country { get; set; } = string.Empty;

        // Employment Information (KYC Requirement)
        [Required]
        [StringLength(100)]
        public string Occupation { get; set; } = string.Empty;
        
        [StringLength(200)]
        public string? EmployerName { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal? MonthlyIncome { get; set; }

        // Emergency Contact (Banking Standard)
        [Required]
        [StringLength(100)]
        public string EmergencyContactName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(20)]
        public string EmergencyContactPhone { get; set; } = string.Empty;
        
        [Required]
        [StringLength(50)]
        public string EmergencyContactRelation { get; set; } = string.Empty;

        // Essential KYC Documents
        [Required]
        public IFormFile IdProofDocument { get; set; } = null!;
        
        [Required]
        [StringLength(50)]
        public string IdProofType { get; set; } = string.Empty; // "Passport", "NationalID", "DrivingLicense"
        
        [Required]
        [StringLength(50)]
        public string IdProofNumber { get; set; } = string.Empty;

        [Required]
        public IFormFile AddressProofDocument { get; set; } = null!;
        
        [Required]
        [StringLength(50)]
        public string AddressProofType { get; set; } = string.Empty; // "UtilityBill", "BankStatement", "RentalAgreement"

        // Income Proof (For certain account types)
        public IFormFile? IncomeProofDocument { get; set; }

        // Essential Compliance
        [Required]
        public bool TermsAndConditionsAccepted { get; set; }
        
        [Required]
        public bool PrivacyPolicyAccepted { get; set; }
        
        [Required]
        public bool AntiMoneyLaunderingConsent { get; set; }
    }
}
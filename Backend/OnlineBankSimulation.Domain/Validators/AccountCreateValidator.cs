using FluentValidation;
using OnlineBank.Core.DTOs.AccountDtos;
using OnlineBank.Core.Enums;

namespace OnlineBank.Core.Validators
{
    public class AccountCreateValidator : AbstractValidator<AccountCreateDto>
    {
        public AccountCreateValidator()
        {
            RuleFor(x => x.AccountType)
                .IsInEnum()
                .WithMessage("Valid account type is required");

            RuleFor(x => x.InitialDeposit)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Initial deposit must be non-negative")
                .LessThanOrEqualTo(1000000)
                .WithMessage("Initial deposit cannot exceed 10,00,000");

            RuleFor(x => x.Purpose)
                .MaximumLength(200)
                .WithMessage("Purpose cannot exceed 200 characters");

            // Branch validation
            RuleFor(x => x.BranchId)
                .GreaterThan(0)
                .WithMessage("Valid branch selection is required");

            // Address validation
            RuleFor(x => x.AddressLine1)
                .NotEmpty()
                .MaximumLength(200)
                .WithMessage("Address line 1 is required and cannot exceed 200 characters");

            RuleFor(x => x.City)
                .NotEmpty()
                .MaximumLength(100)
                .WithMessage("City is required and cannot exceed 100 characters");

            RuleFor(x => x.State)
                .NotEmpty()
                .MaximumLength(100)
                .WithMessage("State is required and cannot exceed 100 characters");

            RuleFor(x => x.PostalCode)
                .NotEmpty()
                .MaximumLength(20)
                .WithMessage("Postal code is required and cannot exceed 20 characters");

            RuleFor(x => x.Country)
                .NotEmpty()
                .MaximumLength(100)
                .WithMessage("Country is required and cannot exceed 100 characters");

            // Employment validation
            RuleFor(x => x.Occupation)
                .NotEmpty()
                .MaximumLength(100)
                .WithMessage("Occupation is required and cannot exceed 100 characters");

            RuleFor(x => x.MonthlyIncome)
                .GreaterThanOrEqualTo(0)
                .When(x => x.MonthlyIncome.HasValue)
                .WithMessage("Monthly income must be non-negative");

            // Emergency contact validation
            RuleFor(x => x.EmergencyContactName)
                .NotEmpty()
                .MaximumLength(100)
                .WithMessage("Emergency contact name is required and cannot exceed 100 characters");

            RuleFor(x => x.EmergencyContactPhone)
                .NotEmpty()
                .MaximumLength(20)
                .Matches(@"^[+]?[0-9\s\-\(\)]+$")
                .WithMessage("Valid emergency contact phone number is required");

            RuleFor(x => x.EmergencyContactRelation)
                .NotEmpty()
                .MaximumLength(50)
                .WithMessage("Emergency contact relation is required and cannot exceed 50 characters");

            // KYC document validation
            RuleFor(x => x.IdProofType)
                .NotEmpty()
                .Must(x => new[] { "Passport", "NationalID", "DrivingLicense" }.Contains(x))
                .WithMessage("Valid ID proof type is required (Passport, NationalID, or DrivingLicense)");

            RuleFor(x => x.IdProofNumber)
                .NotEmpty()
                .MaximumLength(50)
                .WithMessage("ID proof number is required and cannot exceed 50 characters");

            RuleFor(x => x.AddressProofType)
                .NotEmpty()
                .Must(x => new[] { "UtilityBill", "BankStatement", "RentalAgreement" }.Contains(x))
                .WithMessage("Valid address proof type is required (UtilityBill, BankStatement, or RentalAgreement)");

            // Compliance validation
            RuleFor(x => x.TermsAndConditionsAccepted)
                .Equal(true)
                .WithMessage("Terms and conditions must be accepted");

            RuleFor(x => x.PrivacyPolicyAccepted)
                .Equal(true)
                .WithMessage("Privacy policy must be accepted");

            RuleFor(x => x.AntiMoneyLaunderingConsent)
                .Equal(true)
                .WithMessage("Anti-money laundering consent is required");
        }
    }
}
using FluentValidation;
using OnlineBank.Core.DTOs.TransactionDtos;
using OnlineBank.Core.Enums;

namespace OnlineBank.Core.Validators
{
    public class DepositValidator : AbstractValidator<DepositDto>
    {
        public DepositValidator()
        {
            RuleFor(x => x.ToAccountNumber)
                .NotEmpty().WithMessage("Account number is required")
                .Length(8, 20).WithMessage("Account number must be 8-20 characters")
                .Matches(@"^[A-Za-z0-9]+$").WithMessage("Account number can only contain letters and numbers");
                
            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("Deposit amount must be greater than zero")
                .LessThanOrEqualTo(1000000).WithMessage("Deposit amount cannot exceed ₹10,00,000");

            RuleFor(x => x.DepositMode)
                .IsInEnum().WithMessage("Valid deposit mode is required");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters");

            RuleFor(x => x.ReferenceNumber)
                .MaximumLength(100).WithMessage("Reference number cannot exceed 100 characters");
                
            RuleFor(x => x.DepositorName)
                .NotEmpty().WithMessage("Depositor name is required")
                .MaximumLength(200).WithMessage("Depositor name cannot exceed 200 characters");
        }
    }
}
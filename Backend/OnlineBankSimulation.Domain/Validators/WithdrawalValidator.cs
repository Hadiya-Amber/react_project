using FluentValidation;
using OnlineBank.Core.DTOs.TransactionDtos;
using OnlineBank.Core.Enums;

namespace OnlineBank.Core.Validators
{
    public class WithdrawalValidator : AbstractValidator<WithdrawalDto>
    {
        public WithdrawalValidator()
        {
            RuleFor(x => x.FromAccountNumber)
                .NotEmpty().WithMessage("Account number is required")
                .Length(8, 20).WithMessage("Account number must be 8-20 characters")
                .Matches(@"^[A-Za-z0-9]+$").WithMessage("Account number can only contain letters and numbers");
                
            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("Withdrawal amount must be greater than zero")
                .LessThanOrEqualTo(200000).WithMessage("Maximum withdrawal limit is ₹2,00,000");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters");

            RuleFor(x => x.Pin)
                .Length(4).WithMessage("PIN must be exactly 4 digits")
                .Matches(@"^\d{4}$").WithMessage("PIN must contain only digits")
                .When(x => !string.IsNullOrEmpty(x.Pin));
                
            RuleFor(x => x.WithdrawalMode)
                .IsInEnum().WithMessage("Invalid withdrawal mode");
                
            RuleFor(x => x.BranchId)
                .GreaterThan(0).WithMessage("Branch ID is required");
                
            RuleFor(x => x.ReferenceNumber)
                .NotEmpty().WithMessage("Reference number is required for cheque withdrawals")
                .When(x => x.WithdrawalMode == WithdrawalMode.Cheque);
        }
    }
}
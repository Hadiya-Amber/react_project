using FluentValidation;
using OnlineBank.Core.DTOs.TransactionDtos;

namespace OnlineBank.Core.Validators
{
    public class TransferValidator : AbstractValidator<TransferDto>
    {
        public TransferValidator()
        {
            RuleFor(x => x.FromAccountNumber)
                .NotEmpty().WithMessage("Source account number is required")
                .Length(8, 20).WithMessage("Account number must be 8-20 characters")
                .Matches(@"^[A-Za-z0-9]+$").WithMessage("Account number can only contain letters and numbers");
                
            RuleFor(x => x.ToAccountNumber)
                .NotEmpty().WithMessage("Destination account number is required")
                .Length(8, 20).WithMessage("Account number must be 8-20 characters")
                .Matches(@"^[A-Za-z0-9]+$").WithMessage("Account number can only contain letters and numbers");

            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("Transfer amount must be greater than zero")
                .LessThanOrEqualTo(500000).WithMessage("Transfer amount cannot exceed ₹5,00,000");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters");

            RuleFor(x => x.Reference)
                .MaximumLength(100).WithMessage("Reference cannot exceed 100 characters");
        }
    }
}
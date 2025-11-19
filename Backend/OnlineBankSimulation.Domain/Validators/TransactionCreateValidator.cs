using FluentValidation;
using OnlineBank.Core.DTOs.TransactionDtos;
using OnlineBank.Core.Enums;

namespace OnlineBank.Core.Validators
{
    public class TransactionCreateValidator : AbstractValidator<TransactionCreateDto>
    {
        public TransactionCreateValidator()
        {
            RuleFor(x => x.FromAccountId)
                .GreaterThan(0)
                .WithMessage("From account ID is required");

            RuleFor(x => x.Amount)
                .GreaterThan(0)
                .WithMessage("Amount must be greater than zero")
                .LessThanOrEqualTo(1000000)
                .WithMessage("Amount cannot exceed ₹10,00,000 per transaction");

            RuleFor(x => x.TransactionType)
                .IsInEnum()
                .WithMessage("Valid transaction type is required");

            RuleFor(x => x.ToAccountId)
                .GreaterThan(0)
                .WithMessage("To account ID is required for transfers")
                .When(x => x.TransactionType == TransactionType.Transfer);

            RuleFor(x => x.Description)
                .MaximumLength(200)
                .WithMessage("Description cannot exceed 200 characters");

            RuleFor(x => x.Reference)
                .MaximumLength(50)
                .WithMessage("Reference cannot exceed 50 characters");
        }
    }
}
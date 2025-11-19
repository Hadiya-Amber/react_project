using FluentValidation;
using OnlineBank.Core.DTOs.TransactionDtos;

namespace OnlineBank.Core.Validators
{
    public class TransactionApprovalValidator : AbstractValidator<TransactionApprovalDto>
    {
        public TransactionApprovalValidator()
        {
            RuleFor(x => x.Remarks)
                .MaximumLength(500).WithMessage("Remarks cannot exceed 500 characters");

            When(x => !x.IsApproved, () =>
            {
                RuleFor(x => x.Remarks)
                    .NotEmpty().WithMessage("Remarks are required when rejecting a transaction");
            });
        }
    }
}
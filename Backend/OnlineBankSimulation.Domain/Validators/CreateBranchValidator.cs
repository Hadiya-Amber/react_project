using FluentValidation;
using OnlineBank.Core.DTOs.BranchDtos;

namespace OnlineBank.Core.Validators
{
    public class CreateBranchValidator : AbstractValidator<CreateBranchDto>
    {
        public CreateBranchValidator()
        {
            RuleFor(x => x.BranchName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.BranchCode).NotEmpty().MaximumLength(10);
            RuleFor(x => x.Address).NotEmpty().MaximumLength(500);
            RuleFor(x => x.City).NotEmpty().MaximumLength(50);
            RuleFor(x => x.State).NotEmpty().MaximumLength(50);
            RuleFor(x => x.IFSCCode).NotEmpty().Length(11).Matches(@"^[A-Z]{4}0[A-Z0-9]{6}$");
            RuleFor(x => x.PhoneNumber).NotEmpty().Matches(@"^\d{10}$");
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
        }
    }
}
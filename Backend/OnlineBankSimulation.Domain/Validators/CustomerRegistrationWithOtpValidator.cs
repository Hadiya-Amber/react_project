using FluentValidation;
using OnlineBank.Core.DTOs.UserDtos;

namespace OnlineBank.Core.Validators
{
    public class CustomerRegistrationWithOtpValidator : AbstractValidator<CustomerRegistrationWithOtpDto>
    {
        public CustomerRegistrationWithOtpValidator()
        {
            RuleFor(x => x.RegistrationData)
                .NotNull().WithMessage("Registration data is required")
                .SetValidator(new CustomerRegistrationValidator());

            RuleFor(x => x.OtpCode)
                .NotEmpty().WithMessage("OTP verification code is required")
                .Length(6).WithMessage("OTP must be exactly 6 digits")
                .Matches(@"^\d{6}$").WithMessage("OTP must contain only numbers");
        }
    }
}
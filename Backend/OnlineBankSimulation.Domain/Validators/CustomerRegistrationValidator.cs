using FluentValidation;
using OnlineBank.Core.DTOs.UserDtos;

namespace OnlineBank.Core.Validators
{
    public class CustomerRegistrationValidator : AbstractValidator<CustomerRegistrationDto>
    {
        public CustomerRegistrationValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required")
                .Length(2, 100).WithMessage("Full name must be between 2 and 100 characters")
                .Matches(@"^[a-zA-Z\s]+$").WithMessage("Full name can only contain letters and spaces");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email address is required")
                .EmailAddress().WithMessage("Please enter a valid email address")
                .MaximumLength(100).WithMessage("Email cannot exceed 100 characters");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Phone number is required")
                .Matches(@"^[6-9]\d{9}$").WithMessage("Please enter a valid 10-digit Indian mobile number starting with 6-9");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters long")
                .MaximumLength(100).WithMessage("Password cannot exceed 100 characters")
                .Matches(@"^(?=.*[a-z])").WithMessage("Password must contain at least one lowercase letter")
                .Matches(@"^(?=.*[A-Z])").WithMessage("Password must contain at least one uppercase letter")
                .Matches(@"^(?=.*\d)").WithMessage("Password must contain at least one digit")
                .Matches(@"^(?=.*[@$!%*?&])").WithMessage("Password must contain at least one special character (@$!%*?&)");

            RuleFor(x => x.ConfirmPassword)
                .NotEmpty().WithMessage("Please confirm your password")
                .Equal(x => x.Password).WithMessage("Password and confirm password do not match");

            RuleFor(x => x.Address)
                .NotEmpty().WithMessage("Address is required")
                .MaximumLength(500).WithMessage("Address cannot exceed 500 characters");

            RuleFor(x => x.DateOfBirth)
                .NotEmpty().WithMessage("Date of birth is required")
                .Must(BeReasonableAge).WithMessage("Please enter a valid date of birth");


        }

        private static bool BeReasonableAge(DateTime dateOfBirth)
        {
            var age = DateTime.UtcNow.Year - dateOfBirth.Year;
            if (dateOfBirth > DateTime.UtcNow.AddYears(-age)) age--;
            return age >= 0 && age <= 100;
        }
    }
}
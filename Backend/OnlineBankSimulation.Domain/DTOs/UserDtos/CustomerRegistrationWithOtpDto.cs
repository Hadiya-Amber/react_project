

namespace OnlineBank.Core.DTOs.UserDtos
{
    public class CustomerRegistrationWithOtpDto
    {
        public CustomerRegistrationDto RegistrationData { get; set; } = new();
        public string OtpCode { get; set; } = string.Empty;
    }
}
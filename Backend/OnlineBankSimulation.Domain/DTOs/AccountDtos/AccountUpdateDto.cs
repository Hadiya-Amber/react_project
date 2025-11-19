namespace OnlineBank.Core.DTOs.AccountDtos
{
    public class AccountUpdateDto
    {
        public bool? IsDormant { get; set; }
        public string? Purpose { get; set; }
    }
}
namespace OnlineBank.Core.Interfaces
{
    public interface IBusinessLogicService
    {
        Task<bool> CalculateAndApplyInterestAsync();
        Task<bool> ProcessAutoTransfersAsync();
        Task<bool> ProcessLongTermDepositRewardsAsync();
        Task<bool> ApplyServiceChargesAsync();
        Task<bool> SendAccountNotificationsAsync();
    }
}
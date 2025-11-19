using OnlineBank.Core.Common;

namespace OnlineBank.Core.Interfaces
{
    public interface IStatsService
    {
        Task<ServiceResult<object>> GetBankOverviewAsync();
    }
}
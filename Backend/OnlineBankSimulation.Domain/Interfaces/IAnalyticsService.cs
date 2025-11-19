using OnlineBank.Core.Common;
using OnlineBank.Core.DTOs.AnalyticsDtos;

namespace OnlineBank.Core.Interfaces
{
    public interface IAnalyticsService
    {
        // Admin focused methods
        Task<ServiceResult<object>> GetOverviewStatsAsync();
        Task<ServiceResult<object>> GetBranchPerformanceAsync();
        Task<ServiceResult<object>> GetRecentActivitiesAsync(int count, int? branchId = null);
        
        // Branch Manager focused methods
        Task<ServiceResult<object>> GetBranchInfoAsync(int userId);
        Task<ServiceResult<object>> GetMonthlyStatsAsync(int userId);
        
        // Customer focused methods
        Task<ServiceResult<object>> GetPersonalInfoAsync(int userId);
        Task<ServiceResult<object>> GetAccountSummaryAsync(int userId);
        Task<ServiceResult<object>> GetCustomerTransactionsAsync(int userId, int count);
        Task<ServiceResult<object>> GetCustomerMonthlyStatsAsync(int userId);
        
        // Combined dashboard methods (for efficient loading)
        Task<ServiceResult<object>> GetAdminDashboardAsync();
        Task<ServiceResult<object>> GetAdminSuperDashboardAsync();
        Task<ServiceResult<object>> GetBranchManagerDashboardAsync(int userId);
        Task<ServiceResult<object>> GetCustomerDashboardAsync(int userId);
        Task<ServiceResult<object>> GetCustomerCompleteDashboardAsync(int userId);
        
        // Shared methods
        Task<ServiceResult<List<TransactionTrendDto>>> GetTransactionTrendsAsync(int days, int? branchId = null);
        Task<ServiceResult<List<AccountTypeDistributionDto>>> GetAccountStatisticsAsync(int? branchId = null);
        Task<ServiceResult<int>> GetUserBranchIdAsync(int userId);
    }
}
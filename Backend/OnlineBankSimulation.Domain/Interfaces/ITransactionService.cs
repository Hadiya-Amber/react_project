using System.Collections.Generic;
using System.Threading.Tasks;
using OnlineBank.Core.Models;
using OnlineBank.Core.DTOs.TransactionDtos;
using OnlineBank.Core.DTOs;
using OnlineBank.Core.Enums;

namespace OnlineBank.Core.Interfaces
{
    public interface ITransactionService
    {
        Task<IEnumerable<Transaction>> GetAllTransactionsAsync();
        Task<Transaction?> GetTransactionByIdAsync(int id);
        Task<TransactionReadDto?> GetTransactionDetailsAsync(int id);
        Task<Transaction> CreateTransactionAsync(TransactionCreateDto dto);
        Task<bool> DeleteTransactionAsync(int id);
        Task<(bool Success, string Message)> ProcessDepositAsync(DepositDto dto, int accountId = 0);
        Task<(bool Success, string Message)> ProcessWithdrawalAsync(WithdrawalDto dto);
        Task<(bool Success, string Message)> ProcessTransferAsync(TransferDto dto);
        Task<(bool Success, string Message, IEnumerable<TransactionReadDto>? Data)> GetPendingTransactionsAsync();
        Task<(bool Success, string Message, IEnumerable<TransactionReadDto>? Data)> GetPendingTransactionsByBranchAsync(int branchId);
        Task<(bool Success, string Message)> ApproveTransactionAsync(int transactionId, string employeeId, bool isApproved = true, string? remarks = null);
        Task<(bool Success, string Message, IEnumerable<TransactionReadDto>? Data)> GetAccountStatementAsync(int accountId, DateTime fromDate, DateTime toDate);
        
        // Enhanced transaction methods - removed unused payment types

        Task<(bool Success, string Message)> ApproveTransactionByManagerAsync(int transactionId, int managerId);
        Task<(bool Success, string Message)> ReverseTransactionAsync(int transactionId, string reason);
        
        // Analytics methods
        Task<OnlineBank.Core.DTOs.TransactionDtos.TransactionAnalyticsDto> GetTransactionAnalyticsAsync(DateTime fromDate, DateTime toDate, TransactionType? transactionType = null);
        Task<IEnumerable<OnlineBank.Core.DTOs.TransactionDtos.CustomerBalanceDto>> GetTop10CustomersByBalanceAsync();
        Task<(bool Success, string Message, IEnumerable<TransactionReadDto>? Data)> GetTransactionsByDateRangeAsync(DateTime start, DateTime end);
        Task<(bool Success, string Message, IEnumerable<TransactionReadDto>? Data)> GetFilteredTransactionsAsync(TransactionFilterDto filter);
        
        // Dashboard analytics
        Task<OnlineBank.Core.DTOs.TransactionDtos.DashboardAnalyticsDto> GetDashboardAnalyticsAsync();
        Task<IEnumerable<OnlineBank.Core.DTOs.TransactionDtos.TransactionTypeAnalyticsDto>> GetTransactionTypeAnalyticsAsync();
        Task<IEnumerable<OnlineBank.Core.DTOs.TransactionDtos.CustomerVolumeDto>> GetTop10CustomersByVolumeAsync();
        
        // Customer analytics
        Task<OnlineBank.Core.DTOs.TransactionDtos.CustomerFinancialSummaryDto> GetCustomerFinancialSummaryAsync(int userId, int months);
        Task<IEnumerable<OnlineBank.Core.DTOs.TransactionDtos.CustomerMonthlyTrendDto>> GetCustomerMonthlyTrendsAsync(int userId, int months);
        Task<IEnumerable<OnlineBank.Core.DTOs.TransactionDtos.CustomerExpenseCategoryDto>> GetCustomerExpenseCategoriesAsync(int userId, int months);
        
        // Enhanced user-specific transaction methods
        Task<(bool Success, string Message, UserTransactionHistoryDto? Data)> GetUserTransactionHistoryAsync(int userId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<(bool Success, string Message, DashboardTransactionSummary? Data)> GetDashboardTransactionSummaryAsync(int userId);
        
        // Utility methods
        Task<(bool Success, string Message, int FixedCount)> FixFailedSmallTransactionsAsync();
        Task<(bool Success, string Message, byte[]? Data)> GenerateReceiptAsync(int transactionId);
        Task<bool> UpdateReceiptPathAsync(int transactionId, string receiptPath);
        
        // Missing methods
        Task<(bool Success, string Message)> ProcessLoanPaymentAsync(LoanPaymentDto dto);
        Task<(bool Success, string Message)> ProcessInvestmentDepositAsync(InvestmentDepositDto dto);
    }
}

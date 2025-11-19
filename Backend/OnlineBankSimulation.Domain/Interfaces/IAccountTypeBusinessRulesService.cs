using OnlineBank.Core.Models;
using OnlineBank.Core.Enums;

namespace OnlineBankSimulation.Domain.Interfaces
{
    public interface IAccountTypeBusinessRulesService
    {
        (bool IsAllowed, string Message) ValidateTransaction(Account account, TransactionType transactionType, decimal amount);
        decimal GetDailyTransactionLimit(AccountType accountType);
        decimal GetMinimumBalance(AccountType accountType);
        bool RequiresApproval(AccountType accountType, decimal amount);
    }
}
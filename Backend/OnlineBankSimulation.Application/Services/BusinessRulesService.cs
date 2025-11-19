using OnlineBank.Core.Models;
using OnlineBank.Core.Enums;

namespace OnlineBankSimulation.Application.Services
{
    public class BusinessRulesService
    {
        public async Task<(bool IsValid, string Message)> ValidateTransaction(Transaction transaction, Account account)
        {
            if (transaction.Amount <= 0)
                return (false, "Amount must be greater than zero");

            if (account.Status != AccountStatus.Active)
                return (false, "Account is not active");

            if (transaction.TransactionType == TransactionType.Withdrawal && account.Balance < transaction.Amount)
                return (false, "Insufficient balance");

            return (true, "Valid transaction");
        }

        public async Task<bool> RequiresManagerApproval(Transaction transaction)
        {
            return transaction.Amount > 50000;
        }

        public async Task<decimal> CalculateFee(Transaction transaction)
        {
            return transaction.TransactionType switch
            {
                TransactionType.Transfer when transaction.Amount > 10000 => 10,
                TransactionType.Withdrawal when transaction.Amount > 5000 => 5,
                _ => 0
            };
        }
    }
}
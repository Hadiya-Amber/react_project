using OnlineBank.Core.Models;
using OnlineBank.Core.Enums;
using OnlineBankSimulation.Domain.Interfaces;

namespace OnlineBankSimulation.Application.Services
{
    public interface IAccountTypeBusinessRulesService
    {
        (bool IsAllowed, string Message) ValidateTransaction(Account account, TransactionType transactionType, decimal amount);
        decimal GetDailyTransactionLimit(AccountType accountType);
        decimal GetMinimumBalance(AccountType accountType);
        bool RequiresApproval(AccountType accountType, decimal amount);
    }

    public class AccountTypeBusinessRulesService : OnlineBankSimulation.Domain.Interfaces.IAccountTypeBusinessRulesService, IAccountTypeBusinessRulesService
    {
        public (bool IsAllowed, string Message) ValidateTransaction(Account account, TransactionType transactionType, decimal amount)
        {
            switch (account.Type)
            {
                case AccountType.Minor:
                    return ValidateMinorAccountTransaction(transactionType, amount);
                
                case AccountType.Major:
                    return ValidateMajorAccountTransaction(account, transactionType, amount);
                
                case AccountType.Savings:
                    return ValidateSavingsAccountTransaction(account, transactionType, amount);
                
                case AccountType.Current:
                    return ValidateCurrentAccountTransaction(account, transactionType, amount);
                
                default:
                    return (true, "Transaction allowed");
            }
        }

        public decimal GetDailyTransactionLimit(AccountType accountType)
        {
            return accountType switch
            {
                AccountType.Minor => 10000m,
                AccountType.Major => 100000m,
                AccountType.Savings => 50000m,
                AccountType.Current => 200000m,
                _ => 50000m
            };
        }

        public decimal GetMinimumBalance(AccountType accountType)
        {
            return accountType switch
            {
                AccountType.Minor => 500m,
                AccountType.Major => 1000m,
                AccountType.Savings => 1000m,
                AccountType.Current => 5000m,
                _ => 1000m
            };
        }

        public bool RequiresApproval(AccountType accountType, decimal amount)
        {
            return accountType switch
            {
                AccountType.Minor => amount > 5000m,
                AccountType.Savings => amount > 100000m,
                AccountType.Current => amount > 500000m,
                _ => amount > 100000m
            };
        }

        private (bool IsAllowed, string Message) ValidateMinorAccountTransaction(TransactionType transactionType, decimal amount)
        {
            if (amount > 10000m)
                return (false, "Minor accounts cannot transact more than ₹10,000 per day");
            
            if (transactionType == TransactionType.Transfer && amount > 5000m)
                return (false, "Minor accounts cannot transfer more than ₹5,000 per transaction");
            
            return (true, "Transaction allowed");
        }

        private (bool IsAllowed, string Message) ValidateSavingsAccountTransaction(Account account, TransactionType transactionType, decimal amount)
        {
            if (transactionType == TransactionType.Withdrawal)
            {
                var balanceAfterWithdrawal = account.Balance - amount;
                if (balanceAfterWithdrawal < GetMinimumBalance(AccountType.Savings))
                    return (false, $"Minimum balance of ₹{GetMinimumBalance(AccountType.Savings):N2} must be maintained");
            }
            
            if (amount > GetDailyTransactionLimit(AccountType.Savings))
                return (false, $"Daily transaction limit of ₹{GetDailyTransactionLimit(AccountType.Savings):N2} exceeded");
            
            return (true, "Transaction allowed");
        }

        private (bool IsAllowed, string Message) ValidateCurrentAccountTransaction(Account account, TransactionType transactionType, decimal amount)
        {
            if (transactionType == TransactionType.Withdrawal)
            {
                var balanceAfterWithdrawal = account.Balance - amount;
                if (balanceAfterWithdrawal < GetMinimumBalance(AccountType.Current))
                    return (false, $"Minimum balance of ₹{GetMinimumBalance(AccountType.Current):N2} must be maintained");
            }
            
            return (true, "Transaction allowed");
        }

        private (bool IsAllowed, string Message) ValidateMajorAccountTransaction(Account account, TransactionType transactionType, decimal amount)
        {
            if (transactionType == TransactionType.Withdrawal)
            {
                var balanceAfterWithdrawal = account.Balance - amount;
                if (balanceAfterWithdrawal < GetMinimumBalance(AccountType.Major))
                    return (false, $"Minimum balance of ₹{GetMinimumBalance(AccountType.Major):N2} must be maintained");
            }
            
            if (amount > GetDailyTransactionLimit(AccountType.Major))
                return (false, $"Daily transaction limit of ₹{GetDailyTransactionLimit(AccountType.Major):N2} exceeded");
            
            return (true, "Transaction allowed");
        }
    }
}
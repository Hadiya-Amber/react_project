using OnlineBank.Core.Models;
using OnlineBank.Core.Enums;
using OnlineBank.Core.Interfaces;
using OnlineBank.Core.Constants;
using Microsoft.Extensions.Logging;

namespace OnlineBankSimulation.Application.Services
{
    public class BusinessRulesEngine : IBusinessRulesEngine
    {
        private readonly ILogger<BusinessRulesEngine> _logger;

        public BusinessRulesEngine(ILogger<BusinessRulesEngine> logger)
        {
            _logger = logger;
        }

        public (bool IsValid, string Message) ValidateTransaction(Transaction transaction, Account fromAccount, Account? toAccount = null)
        {
            try
            {
                // Amount validation using constants
                if (transaction.Amount < BusinessRuleConstants.MinTransactionAmount)
                    return (false, TransactionMessages.InvalidAmount);

                if (transaction.Amount > BusinessRuleConstants.MaxTransactionAmount)
                    return (false, TransactionMessages.ExceedsLimit);

                // Account status validation
                if (!fromAccount.IsActive)
                    return (false, TransactionMessages.AccountInactive);

                if (fromAccount.Status != AccountStatus.Active)
                    return (false, AccountMessages.AccountInactive);

                // Balance validation for debit transactions
                if (IsDebitTransaction(transaction.TransactionType))
                {
                    if (fromAccount.Balance < transaction.Amount)
                        return (false, TransactionMessages.InsufficientBalance);
                }

                // Same account transfer validation
                if (transaction.TransactionType == TransactionType.Transfer && 
                    transaction.FromAccountId == transaction.ToAccountId)
                    return (false, TransactionMessages.SameAccountTransfer);

                // Minor account limit validation
                if (IsMinorAccount(fromAccount) && transaction.Amount > BusinessRuleConstants.MinorAccountLimit)
                    return (false, TransactionMessages.MinorAccountLimitExceeded);

                return (true, "Transaction is valid");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating transaction");
                return (false, TransactionMessages.UnexpectedError);
            }
        }

        public bool RequiresApproval(Transaction transaction, Account fromAccount)
        {
            try
            {
                return transaction.Amount > BusinessRuleConstants.HighValueTransactionLimit;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking approval requirement");
                return true; // Default to requiring approval on error
            }
        }

        public string GetRequiredApprovalLevel(Transaction transaction, Account fromAccount)
        {
            try
            {
                if (transaction.Amount > BusinessRuleConstants.HighValueTransactionLimit)
                    return BusinessRuleConstants.ManagerLevel;
                
                return BusinessRuleConstants.TellerLevel;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error determining approval level");
                return BusinessRuleConstants.ManagerLevel; // Default to highest level on error
            }
        }

        public (bool IsMinor, bool IsGirlChild) ClassifyAccount(User user)
        {
            try
            {
                var age = CalculateAge(user.DateOfBirth);
                var isMinor = age < BusinessRuleConstants.MinimumAge;
                var isGirlChild = user.Gender == Gender.Female && isMinor;
                return (isMinor, isGirlChild);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error classifying account for user: {UserId}", user.Id);
                return (false, false); // Default to adult account on error
            }
        }

        public bool ShouldTransitionToMajor(Account account, User user)
        {
            try
            {
                var age = CalculateAge(user.DateOfBirth);
                return age >= BusinessRuleConstants.MinimumAge;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking transition eligibility for account: {AccountId}", account.Id);
                return false; // Default to no transition on error
            }
        }

        private int CalculateAge(DateTime dateOfBirth)
        {
            var today = DateTime.UtcNow;
            var age = today.Year - dateOfBirth.Year;
            if (dateOfBirth.Date > today.AddYears(-age)) age--;
            return age;
        }

        private bool IsMinorAccount(Account account)
        {
            return account.Type == AccountType.Minor;
        }

        private bool IsDebitTransaction(TransactionType type)
        {
            return type switch
            {
                TransactionType.Withdrawal => true,
                TransactionType.Transfer => true,
                _ => false
            };
        }

        public decimal CalculateTransactionFee(TransactionType type, decimal amount)
        {
            try
            {
                return type switch
                {
                    TransactionType.Transfer when amount > BusinessRuleConstants.TransferFeeThreshold => BusinessRuleConstants.StandardTransferFee,
                    TransactionType.Withdrawal when amount > BusinessRuleConstants.WithdrawalFeeThreshold => BusinessRuleConstants.StandardWithdrawalFee,
                    _ => 0m
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating transaction fee");
                return 0m;
            }
        }

        public bool IsValidTransactionStatus(TransactionStatus currentStatus, TransactionStatus newStatus)
        {
            try
            {
                return (currentStatus, newStatus) switch
                {
                    (TransactionStatus.Pending, TransactionStatus.Processing) => true,
                    (TransactionStatus.Processing, TransactionStatus.Completed) => true,
                    (TransactionStatus.Processing, TransactionStatus.Failed) => true,
                    _ => false
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating transaction status transition");
                return false;
            }
        }
    }
}
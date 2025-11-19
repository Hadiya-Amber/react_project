using OnlineBank.Core.Enums;
using OnlineBank.Core.Models;

namespace OnlineBank.Core.Interfaces
{
    public interface IBusinessRulesEngine
    {
        (bool IsValid, string Message) ValidateTransaction(Transaction transaction, Account fromAccount, Account? toAccount = null);
        bool RequiresApproval(Transaction transaction, Account fromAccount);
        string GetRequiredApprovalLevel(Transaction transaction, Account fromAccount);
        (bool IsMinor, bool IsGirlChild) ClassifyAccount(User user);
        bool ShouldTransitionToMajor(Account account, User user);
    }
}
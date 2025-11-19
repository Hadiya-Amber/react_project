using OnlineBank.Core.Models;

namespace OnlineBank.Core.Interfaces
{
    public interface IPdfGenerator
    {
        Task<string?> GenerateTransactionPdfAsync(string customerName, string accountNumber, string transactionType, decimal amount);
        Task<byte[]> GenerateTransactionStatementAsync(IEnumerable<Transaction> transactions, string accountNumber, int accountId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<byte[]> GenerateTransactionReceiptAsync(Transaction transaction, Account? fromAccount, Account? toAccount, User? fromUser, User? toUser);
    }
}
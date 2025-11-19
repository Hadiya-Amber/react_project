import { TransactionDetailDto } from '@/services/transactionService';

export const filterTransactionsByAccountNumber = (
  transactions: TransactionDetailDto[],
  accountNumber: string
): TransactionDetailDto[] => {
  if (!accountNumber.trim()) {
    return transactions;
  }

  const searchTerm = accountNumber.toLowerCase().trim();
  
  return transactions.filter(transaction => 
    transaction.fromAccountNumber?.toLowerCase().includes(searchTerm) ||
    transaction.toAccountNumber?.toLowerCase().includes(searchTerm)
  );
};

export const filterAccountsByNumber = (
  accounts: any[],
  accountNumber: string
): any[] => {
  if (!accountNumber.trim()) {
    return accounts;
  }

  const searchTerm = accountNumber.toLowerCase().trim();
  
  return accounts.filter(account => 
    account.accountNumber?.toLowerCase().includes(searchTerm)
  );
};
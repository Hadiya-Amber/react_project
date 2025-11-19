import { TransactionType, TransactionDirection } from '@/types';

export const getTransactionDirection = (transactionType: TransactionType, amount: number, fromAccount?: string, toAccount?: string, userAccount?: string): TransactionDirection => {
  // For deposits - always credit (money coming in)
  if (transactionType === TransactionType.Deposit) {
    return TransactionDirection.Credit;
  }
  
  // For withdrawals - always debit (money going out)
  if (transactionType === TransactionType.Withdrawal) {
    return TransactionDirection.Debit;
  }
  
  // For transfers - depends on perspective
  if (transactionType === TransactionType.Transfer) {
    if (userAccount) {
      // If user is receiving the transfer
      if (toAccount === userAccount) {
        return TransactionDirection.Credit;
      }
      // If user is sending the transfer
      if (fromAccount === userAccount) {
        return TransactionDirection.Debit;
      }
    }
  }
  
  // Default logic based on amount
  return amount > 0 ? TransactionDirection.Credit : TransactionDirection.Debit;
};

export const formatTransactionAmount = (amount: number, direction: TransactionDirection): string => {
  const sign = direction === TransactionDirection.Credit ? '+' : '-';
  return `${sign}₹${Math.abs(amount).toLocaleString()}`;
};

export const getTransactionDisplayData = (transaction: any, userAccountNumber?: string) => {
  // Determine correct direction
  const direction = getTransactionDirection(
    transaction.transactionType,
    transaction.amount,
    transaction.fromAccountNumber,
    transaction.toAccountNumber,
    userAccountNumber
  );
  
  // Ensure amount is always positive for display
  const displayAmount = Math.abs(transaction.amount);
  
  return {
    ...transaction,
    direction,
    amount: displayAmount,
    formattedAmount: formatTransactionAmount(displayAmount, direction)
  };
};
import { TransactionType, TransactionDirection } from '@/types';

export const getTransactionDirection = (transactionType: TransactionType | number, amount: number, fromAccount?: string, toAccount?: string, userAccount?: string, backendDirection?: number): TransactionDirection => {
  // If backend provides direction, use it (1 = Credit, 0 = Debit)
  if (backendDirection !== undefined) {
    return backendDirection === 1 ? TransactionDirection.Credit : TransactionDirection.Debit;
  }
  
  const typeNum = Number(transactionType);
  
  // For deposits (0) - always credit for the receiving account
  if (typeNum === 0) {
    return TransactionDirection.Credit;
  }
  
  // For withdrawals (1) - always debit (money going out)
  if (typeNum === 1) {
    return TransactionDirection.Debit;
  }
  
  // For transfers (2) - depends on user perspective
  if (typeNum === 2) {
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
    // Default for transfers when no user context
    return TransactionDirection.Debit;
  }
  
  // Default logic
  return TransactionDirection.Credit;
};

export const formatTransactionAmount = (amount: number, direction: TransactionDirection): string => {
  const sign = direction === TransactionDirection.Credit ? '+' : '-';
  return `${sign}₹${Math.abs(amount).toLocaleString()}`;
};

export const getTransactionDisplayData = (transaction: any, userAccountNumber?: string) => {
  const transactionType = Number(transaction.transactionType);
  const displayAmount = Math.abs(transaction.amount);
  
  // Determine correct direction
  const direction = getTransactionDirection(
    transactionType,
    transaction.amount,
    transaction.fromAccountNumber,
    transaction.toAccountNumber,
    userAccountNumber,
    transaction.direction // Use backend-provided direction if available
  );
  
  // Generate user-friendly description and other party info
  let displayDescription = '';
  let otherPartyName = '';
  
  switch (transactionType) {
    case 0: // Deposit
      displayDescription = 'Cash Deposit';
      otherPartyName = transaction.description?.includes('by ') 
        ? transaction.description.split('by ')[1]?.split(' |')[0] || 'Cash Deposit'
        : 'Cash Deposit';
      break;
    case 1: // Withdrawal
      displayDescription = 'Cash Withdrawal';
      otherPartyName = 'Cash Withdrawal';
      break;
    case 2: // Transfer
      if (direction === TransactionDirection.Credit) {
        displayDescription = 'Money Received';
        otherPartyName = transaction.fromAccountHolderName || 
                        (transaction.fromAccountNumber ? `From ${transaction.fromAccountNumber}` : 'Unknown Sender');
      } else {
        displayDescription = 'Money Transfer';
        otherPartyName = transaction.toAccountHolderName || 
                        (transaction.toAccountNumber ? `To ${transaction.toAccountNumber}` : 'Unknown Recipient');
      }
      break;
    default:
      displayDescription = transaction.displayDescription || 'Transaction';
      otherPartyName = transaction.otherPartyName || 'N/A';
  }
  
  return {
    ...transaction,
    direction,
    amount: displayAmount,
    formattedAmount: formatTransactionAmount(displayAmount, direction),
    displayDescription,
    otherPartyName
  };
};
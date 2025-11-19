export enum TransactionType {
  Deposit = 0,
  Withdrawal = 1,
  Transfer = 2
}

export enum TransactionStatus {
  Pending = 0,
  Processing = 1,
  Completed = 2,
  Failed = 3
}

export enum TransactionDirection {
  Credit = 0,  // Money coming in
  Debit = 1    // Money going out
}

export enum DepositMode {
  Cash = 'Cash',
  Cheque = 'Cheque',
  OnlineTransfer = 'OnlineTransfer',
  BankTransfer = 'BankTransfer'
}

export enum WithdrawalMode {
  Cash = 'Cash',
  Cheque = 'Cheque',
  OnlineTransfer = 'OnlineTransfer'
}

export interface Transaction {
  id: number;
  fromAccountId?: number;
  toAccountId?: number;
  amount: number;
  transactionType: TransactionType;
  transactionDate: string;
  description?: string;
  receiptPath?: string;
  transactionReference: string;
  status: TransactionStatus;
  balanceAfterTransaction: number;
  createdAt: string;
  updatedAt?: string;
}

export interface DepositDto {
  toAccountNumber: string;
  amount: number;
  depositMode: DepositMode;
  referenceNumber?: string;
  branchId?: number;
  depositorName?: string;
  description?: string;
}

export interface WithdrawalDto {
  fromAccountNumber: string;
  amount: number;
  withdrawalMode: WithdrawalMode;
  description?: string;
}

export interface TransferDto {
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: number;
  description?: string;
}

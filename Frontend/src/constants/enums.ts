import { UserRole, UserStatus, Gender, AccountType, AccountStatus, TransactionType, TransactionStatus, TransactionDirection, OtpPurpose } from '@/types';

// User Role Labels
export const UserRoleLabels = {
  [UserRole.Customer]: 'Customer',
  [UserRole.BranchManager]: 'Branch Manager',
  [UserRole.Admin]: 'Admin'
} as const;

// User Status Labels
export const UserStatusLabels = {
  [UserStatus.Pending]: 'Pending',
  [UserStatus.Approved]: 'Approved',
  [UserStatus.Rejected]: 'Rejected',
  [UserStatus.Suspended]: 'Suspended'
} as const;

// Gender Labels
export const GenderLabels = {
  [Gender.Male]: 'Male',
  [Gender.Female]: 'Female',
  [Gender.Other]: 'Other'
} as const;

// Account Type Labels
export const AccountTypeLabels = {
  [AccountType.Minor]: 'Minor Account',
  [AccountType.Major]: 'Major Account',
  [AccountType.Savings]: 'Savings Account',
  [AccountType.Current]: 'Current Account'
} as const;

// Account Status Labels
export const AccountStatusLabels = {
  [AccountStatus.Pending]: 'Pending',
  [AccountStatus.UnderReview]: 'Under Review',
  [AccountStatus.Active]: 'Active',
  [AccountStatus.Dormant]: 'Dormant',
  [AccountStatus.Closed]: 'Closed',
  [AccountStatus.Suspended]: 'Suspended'
} as const;

// Transaction Type Labels
export const TransactionTypeLabels = {
  [TransactionType.Deposit]: 'Deposit',
  [TransactionType.Withdrawal]: 'Withdrawal',
  [TransactionType.Transfer]: 'Transfer'
} as const;

// Transaction Status Labels
export const TransactionStatusLabels = {
  [TransactionStatus.Pending]: 'Pending',
  [TransactionStatus.Processing]: 'Processing',
  [TransactionStatus.Completed]: 'Completed',
  [TransactionStatus.Failed]: 'Failed'
} as const;

// OTP Purpose Labels
export const OtpPurposeLabels = {
  [OtpPurpose.Registration]: 'Registration',
  [OtpPurpose.Login]: 'Login',
  [OtpPurpose.PasswordReset]: 'Password Reset',
  [OtpPurpose.TransactionApproval]: 'Transaction Approval',
  [OtpPurpose.ProfileUpdate]: 'Profile Update',
  [OtpPurpose.AccountActivation]: 'Account Activation'
} as const;

// Status Colors for UI
export const UserStatusColors = {
  [UserStatus.Pending]: 'warning',
  [UserStatus.Approved]: 'success',
  [UserStatus.Rejected]: 'error',
  [UserStatus.Suspended]: 'error'
} as const;

export const AccountStatusColors = {
  [AccountStatus.Pending]: 'warning',
  [AccountStatus.UnderReview]: 'info',
  [AccountStatus.Active]: 'success',
  [AccountStatus.Dormant]: 'warning',
  [AccountStatus.Closed]: 'default',
  [AccountStatus.Suspended]: 'error'
} as const;

export const TransactionStatusColors = {
  [TransactionStatus.Pending]: 'warning',
  [TransactionStatus.Processing]: 'info',
  [TransactionStatus.Completed]: 'success',
  [TransactionStatus.Failed]: 'error'
} as const;

// Helper functions
export const getUserRoleLabel = (role: UserRole): string => UserRoleLabels[role] || 'Unknown';
export const getUserStatusLabel = (status: UserStatus): string => UserStatusLabels[status] || 'Unknown';
export const getGenderLabel = (gender: Gender): string => GenderLabels[gender] || 'Unknown';
export const getAccountTypeLabel = (type: AccountType): string => AccountTypeLabels[type] || 'Unknown';
export const getAccountStatusLabel = (status: AccountStatus): string => AccountStatusLabels[status] || 'Unknown';
export const getTransactionTypeLabel = (type: TransactionType): string => TransactionTypeLabels[type] || 'Unknown';
export const getTransactionStatusLabel = (status: TransactionStatus): string => TransactionStatusLabels[status] || 'Unknown';
export const getOtpPurposeLabel = (purpose: OtpPurpose): string => OtpPurposeLabels[purpose] || 'Unknown';

// Transaction Direction Labels
export const TransactionDirectionLabels = {
  [TransactionDirection.Credit]: 'Credit',
  [TransactionDirection.Debit]: 'Debit'
} as const;

export const getTransactionDirectionLabel = (direction: TransactionDirection): string => TransactionDirectionLabels[direction] || 'Unknown';

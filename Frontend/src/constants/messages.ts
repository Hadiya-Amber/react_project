// Error and Success Messages Constants
export const ERROR_MESSAGES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email or password. Please check your credentials and try again.',
  PASSWORD_MISMATCH: 'New password and confirm password do not match',
  PASSWORD_CHANGE_FAILED: 'Password change failed',
  UNAUTHORIZED: 'Please log in to access this feature',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',

  // Account errors
  ACCOUNT_NOT_FOUND: 'Account not found',
  INSUFFICIENT_BALANCE: 'Insufficient account balance',
  ACCOUNT_INACTIVE: 'Account is not active',
  ACCOUNT_CREATION_FAILED: 'Failed to create account',

  // Transaction errors
  SAME_ACCOUNT_TRANSFER: 'Source and destination accounts cannot be the same',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  INVALID_AMOUNT: 'Please enter a valid amount',
  TRANSACTION_NOT_FOUND: 'Transaction not found',

  // Network errors
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  REQUEST_TIMEOUT: 'Request timed out. Please try again.',

  // Validation errors
  REQUIRED_FIELD: (field: string) => `${field} is required`,
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_DATE: 'Please enter a valid date',

  // Generic errors
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
  OPERATION_FAILED: 'Operation failed. Please try again.',
} as const;

export const SUCCESS_MESSAGES = {
  // Authentication success
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PASSWORD_CHANGED: 'Password changed successfully',

  // Account success
  ACCOUNT_CREATED: 'Account created successfully',
  ACCOUNT_UPDATED: 'Account updated successfully',
  ACCOUNT_VERIFIED: 'Account verified successfully',

  // Transaction success
  DEPOSIT_SUCCESS: 'Deposit completed successfully',
  WITHDRAWAL_SUCCESS: 'Withdrawal completed successfully',
  TRANSFER_SUCCESS: 'Transfer completed successfully',
  TRANSACTION_APPROVED: 'Transaction approved successfully',

  // Generic success
  OPERATION_SUCCESS: 'Operation completed successfully',
  DATA_SAVED: 'Data saved successfully',
  DATA_UPDATED: 'Data updated successfully',
} as const;

export const INFO_MESSAGES = {
  LOADING: 'Loading...',
  PROCESSING: 'Processing your request...',
  PLEASE_WAIT: 'Please wait...',
  NO_DATA_FOUND: 'No data found',
  NO_TRANSACTIONS: 'No transactions found',
  NO_ACCOUNTS: 'No accounts found',
} as const;
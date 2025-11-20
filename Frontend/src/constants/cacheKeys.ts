// Cache Keys Constants
export const CACHE_KEYS = {
  // Admin cache keys
  ADMIN_DASHBOARD: 'admin_dashboard_load',
  ADMIN_USERS: 'admin_users',
  ADMIN_DASHBOARD_DATA: 'admin_dashboard_data',

  // Account cache keys
  MY_ACCOUNTS: 'my_accounts',
  ALL_ACCOUNTS: 'all_accounts',
  PENDING_ACCOUNTS: 'pending_accounts',
  ACCOUNT_BY_ID: (id: number) => `account_${id}`,

  // Transaction cache keys
  PENDING_TRANSACTIONS: 'pending_transactions',
  ALL_TRANSACTIONS: 'all_transactions',
  USER_TRANSACTIONS: (userId: string, fromDate?: string, toDate?: string, accountNumber?: string) => 
    `user_transactions_${userId}_${fromDate || 'all'}_${toDate || 'all'}_${accountNumber || 'all'}`,
  DASHBOARD_TRANSACTION_SUMMARY: (userId: string) => `dashboard_transaction_summary_${userId}`,
  TRANSACTION_HISTORY: 'transaction_history',

  // Branch cache keys
  ALL_BRANCHES: 'all_branches',
  BRANCH_BY_ID: (id: number) => `branch_${id}`,
  BRANCH_PERFORMANCE: 'branch_performance',

  // User cache keys
  USER_PROFILE: 'user_profile',
  CURRENT_USER: 'current_user',

  // Stats cache keys
  BANK_STATS: 'bank_stats',
  DASHBOARD_STATS: 'dashboard_stats',

  // OTP cache keys
  OTP_VERIFICATION: 'otp_verification',
  OTP_RESEND: 'otp_resend',
} as const;
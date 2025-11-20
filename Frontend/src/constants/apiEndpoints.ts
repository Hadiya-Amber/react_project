// API Endpoints Constants
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
  },

  // Registration endpoints
  REGISTRATION: {
    REGISTER: '/registration/register',
    VERIFY_OTP: '/registration/verify-otp',
    COMPLETE: '/registration/complete',
    CHANGE_PASSWORD: '/registration/change-password',
    FORGOT_PASSWORD: '/registration/forgot-password',
    RESET_PASSWORD: '/registration/reset-password',
  },

  // Account endpoints
  ACCOUNT: {
    CREATE: '/account/create',
    MY_ACCOUNTS: '/account/my-accounts',
    ALL: '/account',
    BY_ID: (id: number) => `/account/${id}`,
    PENDING: '/account/pending',
    PENDING_BY_BRANCH: (branchId: number) => `/account/pending/branch/${branchId}`,
    VERIFY: (id: number) => `/account/verify/${id}`,
    VERIFY_BRANCH: (id: number) => `/account/verify-branch/${id}`,
    UPDATE: (id: number) => `/account/request-profile-update/${id}`,
    DELETE: (id: number) => `/account/${id}`,
    MARK_VERIFIED: '/account/mark-verified',
    CLOSE: '/account/close',
    REJECT: '/account/reject',
    MARK_DORMANT: '/account/mark-dormant',
    UPDATE_STATUS: '/account/update-status',
  },

  // Transaction endpoints
  TRANSACTION: {
    USER_HISTORY: '/transaction/user-history',
    DASHBOARD_SUMMARY: '/transaction/dashboard-summary',
    DEPOSIT: '/transaction/deposit',
    WITHDRAW: '/transaction/withdraw',
    TRANSFER: '/transaction/transfer',
    PENDING_APPROVAL: '/transaction/pending-approval',
    PENDING_BY_BRANCH: (branchId: number) => `/transaction/pending-approval/branch/${branchId}`,
    APPROVE: (id: number) => `/transaction/approve/${id}`,
    APPROVE_BRANCH_MANAGER: (id: number) => `/transaction/approve-branch-manager/${id}`,
    STATEMENT: '/transaction/statement',
    RECEIPT: '/transaction/receipt',
    PDF_STATEMENT: '/transaction/pdf-statement',
    BILL_PAYMENT: '/transaction/bill-payment',
    LOAN_PAYMENT: '/transaction/loan-payment',
    INVESTMENT_DEPOSIT: '/transaction/investment-deposit',
    FILTER: '/transaction/filter',
    ALL: '/transaction/all',
    REVERSE: (id: number) => `/transaction/reverse/${id}`,
    FIX_FAILED: '/transaction/fix-failed-transactions',
  },

  // Admin endpoints
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    BRANCH_MANAGERS: '/admin/branch-managers',
    BRANCH_MANAGER_BY_ID: (id: number) => `/admin/branch-managers/${id}`,
    USERS: '/admin/users',
  },

  // Branch endpoints
  BRANCH: {
    ALL: '/branch',
    BY_ID: (id: number) => `/branch/${id}`,
    CREATE: '/branch/create',
    UPDATE: (id: number) => `/branch/${id}`,
    DELETE: (id: number) => `/branch/${id}`,
    TOGGLE_STATUS: (id: number) => `/branch/toggle-status/${id}`,
  },

  // OTP endpoints
  OTP: {
    SEND: '/otp/send',
    VERIFY: '/otp/verify',
    RESEND: '/otp/resend',
  },
} as const;
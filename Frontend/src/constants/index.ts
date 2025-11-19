export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ACCOUNTS: '/accounts',
  ACCOUNTS_CREATE: '/accounts/create',
  ACCOUNTS_PENDING: '/accounts/pending',
  TRANSACTIONS: '/transactions',
  TRANSACTIONS_DEPOSIT: '/transactions/deposit',
  TRANSACTIONS_WITHDRAW: '/transactions/withdraw',
  TRANSACTIONS_TRANSFER: '/transactions/transfer',
  TRANSACTIONS_PENDING: '/transactions/pending',
  USERS: '/users',
  PROFILE: '/profile'
} as const;

export const STORAGE_KEYS = {
  TOKEN: import.meta.env.VITE_TOKEN_KEY || 'app_auth_token',
  USER: import.meta.env.VITE_USER_KEY || 'app_user_data'
} as const;

export const MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGIN_FAILED: 'Login failed',
  LOGOUT_SUCCESS: 'Logged out successfully',
  NETWORK_ERROR: 'Network error occurred',
  UNAUTHORIZED: 'Unauthorized access'
} as const;

import api from '@/api/axios';
import { ApiResponse, TransactionType, TransactionStatus } from '@/types';
import { validationGuard } from '@/utils/consolidatedValidation';
import { apiOptimizer } from '@/utils/apiOptimizer';
import { API_ENDPOINTS, CONTENT_TYPES, CACHE_KEYS, ERROR_MESSAGES } from '@/constants';

export enum TransactionDirection {
  Credit = 0,  // Money coming in
  Debit = 1    // Money going out
}

export enum DepositMode {
  Cash = 1,
  Cheque = 2,
  OnlineTransfer = 3,
  DemandDraft = 4,
  NEFT = 5,
  RTGS = 6,
  UPI = 7,
  IMPS = 8
}

export enum WithdrawalMode {
  BankCounter = 1,
  Cheque = 2
}

export interface TransactionDetailDto {
  id: number;
  transactionId: string;
  transactionReference?: string;
  
  // Account Information
  fromAccountId: number;
  fromAccountNumber: string;
  fromAccountHolderName: string;
  toAccountId?: number;
  toAccountNumber?: string;
  toAccountHolderName?: string;
  
  // Transaction Details
  amount: number;
  transactionType: TransactionType;
  status: TransactionStatus;
  description?: string;
  reference?: string;
  transactionDate: string;
  
  // User Perspective Fields
  direction: TransactionDirection;
  displayDescription: string;
  otherPartyName: string;
  otherPartyAccount: string;
  
  // Balance Information
  balanceAfterTransaction?: number;
  
  // Additional Information
  branchName?: string;
  processedBy?: string;
  processedDate?: string;
  remarks?: string;
}

export interface UserTransactionHistoryDto {
  transactions: TransactionDetailDto[];
  currentBalance: number;
  totalCredits: number;
  totalDebits: number;
  totalTransactions: number;
  lastTransactionDate?: string;
  accountNumber: string;
  accountHolderName: string;
}

export interface DashboardTransactionSummary {
  // Recent Transactions (last 5)
  recentTransactions: TransactionDetailDto[];
  
  // Account Balance
  currentBalance: number;
  availableBalance: number;
}

export interface DepositDto {
  toAccountNumber: string;
  amount: number;
  depositMode: DepositMode;
  referenceNumber?: string;
  branchId?: number;
  depositorName?: string;
  description?: string;
  otpCode?: string;
}

export interface WithdrawalDto {
  fromAccountNumber: string;
  amount: number;
  description?: string;
  pin?: string;
  withdrawalMode: WithdrawalMode;
  branchId: number;
  referenceNumber?: string;
}

export interface TransferDto {
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: number;
  description?: string;
  reference?: string;
}

export interface TransactionApprovalDto {
  isApproved: boolean;
  remarks?: string;
}

export interface TransactionReadDto {
  id: number;
  transactionId: string;
  transactionReference?: string;
  fromAccountId: number;
  fromAccountNumber: string;
  toAccountId?: number;
  toAccountNumber?: string;
  amount: number;
  transactionType: TransactionType;
  status: TransactionStatus;
  description?: string;
  reference?: string;
  transactionDate: string;
}

export interface BillPaymentDto {
  fromAccountId: number;
  billType: string;
  billNumber: string;
  amount: number;
  description?: string;
}

export interface LoanPaymentDto {
  fromAccountId: number;
  loanAccountNumber: string;
  amount: number;
  description?: string;
}

export interface InvestmentDepositDto {
  fromAccountId: number;
  investmentType: string;
  amount: number;
  description?: string;
}

export interface TransactionFilterDto {
  fromDate?: string;
  toDate?: string;
  transactionType?: TransactionType;
  status?: TransactionStatus;
  minAmount?: number;
  maxAmount?: number;
  accountId?: number;
  pageNumber?: number;
  pageSize?: number;
}

export const transactionService = {
  // Helper method to get transactions from admin context if available
  getTransactionsFromAdminContext: (adminTransactions: any[]) => {
    return adminTransactions;
  },
  // Enhanced methods for user-specific transaction views with caching
  async getUserTransactionHistory(fromDate?: Date, toDate?: Date, accountNumber?: string): Promise<UserTransactionHistoryDto> {
    // Get user ID from token or localStorage to make cache user-specific
    const userToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    let userId = 'anonymous';
    try {
      if (userToken) {
        const payload = JSON.parse(atob(userToken.split('.')[1]));
        userId = payload.sub || payload.id || 'anonymous';
      }
    } catch {
      userId = 'anonymous';
    }
    const cacheKey = `user_transactions_${userId}_${fromDate?.toISOString().split('T')[0] || 'all'}_${toDate?.toISOString().split('T')[0] || 'all'}_${accountNumber || 'all'}`;
    
    const requestFn = async () => {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate.toISOString().split('T')[0]);
      if (toDate) params.append('toDate', toDate.toISOString().split('T')[0]);
      if (accountNumber) params.append('accountNumber', accountNumber);

      const url = params.toString() ? `${API_ENDPOINTS.TRANSACTION.USER_HISTORY}?${params}` : API_ENDPOINTS.TRANSACTION.USER_HISTORY;
      const response = await api.get<ApiResponse<UserTransactionHistoryDto>>(url);
      
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        if (data.transactions && !data.transactions) {
          data.transactions = data.transactions;
        }
        return data;
      }
      throw new Error(response.data.message || 'Failed to fetch transaction history');
    };

    try {
      return await apiOptimizer.cached(cacheKey, requestFn, 1); // 1 minute cache
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Please log in to view your transactions');
      }
      throw new Error('Failed to fetch transaction history');
    }
  },

  async getDashboardTransactionSummary(): Promise<DashboardTransactionSummary> {
    const requestFn = async () => {
      const response = await api.get<ApiResponse<DashboardTransactionSummary>>(API_ENDPOINTS.TRANSACTION.DASHBOARD_SUMMARY);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch dashboard summary');
    };

    try {
      // Get user ID from token to make cache user-specific
      const userToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      let userId = 'anonymous';
      try {
        if (userToken) {
          const payload = JSON.parse(atob(userToken.split('.')[1]));
          userId = payload.sub || payload.id || 'anonymous';
        }
      } catch {
        userId = 'anonymous';
      }
      return await apiOptimizer.cached(`dashboard_transaction_summary_${userId}`, requestFn, 2); // 2 minute cache
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Please log in to view your dashboard');
      }
      throw new Error('Failed to fetch dashboard summary');
    }
  },

  // Keep all existing methods
  async deposit(data: DepositDto): Promise<any> {
    // Frontend validation - NO API call if this fails
    validationGuard.rules.required(data.toAccountNumber, 'Account number');
    validationGuard.rules.amount(data.amount);
    validationGuard.rules.required(data.depositMode, 'Deposit mode');

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Debug: Deposit data being sent

      const response = await api.post<ApiResponse<any>>(API_ENDPOINTS.TRANSACTION.DEPOSIT, formData, {
        headers: { 'Content-Type': CONTENT_TYPES.FORM_DATA },
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Deposit failed');
    } catch (error: any) {
      // Deposit error occurred
      
      // Handle specific validation errors
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        // Handle business rule violations
        if (errorData?.message) {
          throw new Error(errorData.message);
        }
        
        // Handle validation errors
        if (errorData?.errors) {
          const errorMessages = Object.values(errorData.errors).flat().join(', ');
          throw new Error(errorMessages);
        }
      }
      
      // Handle network or other errors
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.message || 'Deposit failed');
    }
  },

  async withdraw(data: WithdrawalDto): Promise<any> {
    // Frontend validation - NO API call if this fails
    validationGuard.rules.required(data.fromAccountNumber, 'Account number');
    validationGuard.rules.amount(data.amount);
    validationGuard.rules.required(data.withdrawalMode, 'Withdrawal mode');
    validationGuard.rules.required(data.branchId, 'Branch');

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const response = await api.post<ApiResponse<any>>(API_ENDPOINTS.TRANSACTION.WITHDRAW, formData, {
        headers: { 'Content-Type': CONTENT_TYPES.FORM_DATA },
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Withdrawal failed');
    } catch (error: any) {
      // Withdrawal error occurred
      
      // Handle specific validation errors
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        // Handle business rule violations
        if (errorData?.message) {
          throw new Error(errorData.message);
        }
        
        // Handle validation errors
        if (errorData?.errors) {
          const errorMessages = Object.values(errorData.errors).flat().join(', ');
          throw new Error(errorMessages);
        }
      }
      
      // Handle network or other errors
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.message || 'Withdrawal failed');
    }
  },

  async transfer(data: TransferDto): Promise<any> {
    // Frontend validation - NO API call if this fails
    validationGuard.rules.required(data.fromAccountNumber, 'From account number');
    validationGuard.rules.required(data.toAccountNumber, 'To account number');
    validationGuard.rules.amount(data.amount);
    if (data.fromAccountNumber === data.toAccountNumber) {
      throw new Error(ERROR_MESSAGES.SAME_ACCOUNT_TRANSFER);
    }

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const response = await api.post<ApiResponse<any>>(API_ENDPOINTS.TRANSACTION.TRANSFER, formData, {
        headers: { 'Content-Type': CONTENT_TYPES.FORM_DATA },
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Transfer failed');
    } catch (error: any) {
      // Transfer error occurred
      
      // Handle specific validation errors
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        // Handle business rule violations
        if (errorData?.message) {
          throw new Error(errorData.message);
        }
        
        // Handle validation errors
        if (errorData?.errors) {
          const errorMessages = Object.values(errorData.errors).flat().join(', ');
          throw new Error(errorMessages);
        }
      }
      
      // Handle network or other errors
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.message || 'Transfer failed');
    }
  },

  async getPendingTransactions(): Promise<TransactionReadDto[]> {
    const requestFn = async () => {
      const response = await api.get<ApiResponse<TransactionReadDto[]>>(API_ENDPOINTS.TRANSACTION.PENDING_APPROVAL);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch pending transactions');
    };

    return await apiOptimizer.cached(CACHE_KEYS.PENDING_TRANSACTIONS, requestFn, 1); // 1 minute cache
  },

  async getPendingTransactionsByBranch(branchId: number): Promise<TransactionReadDto[]> {
    const response = await api.get<ApiResponse<TransactionReadDto[]>>(API_ENDPOINTS.TRANSACTION.PENDING_BY_BRANCH(branchId));
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch pending transactions');
  },

  async approveTransaction(id: number, data: TransactionApprovalDto): Promise<void> {
    const requestFn = async () => {
      const payload: any = {
        IsApproved: data.isApproved
      };
      
      // Only include remarks if provided (don't send empty string)
      if (data.remarks && data.remarks.trim()) {
        payload.Remarks = data.remarks.trim();
      }

      const response = await api.put<ApiResponse<null>>(API_ENDPOINTS.TRANSACTION.APPROVE(id), payload, {
        headers: { 'Content-Type': CONTENT_TYPES.JSON },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to approve transaction');
      }
    };

    await apiOptimizer.dedupe(`approve_transaction_${id}`, requestFn);
    // Clear related caches
    apiOptimizer.clearCache(CACHE_KEYS.PENDING_TRANSACTIONS);
    apiOptimizer.clearCache(CACHE_KEYS.ALL_TRANSACTIONS);
  },

  async getAccountStatement(fromDate?: Date, toDate?: Date): Promise<TransactionReadDto[]> {
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate.toISOString().split('T')[0]);
      if (toDate) params.append('toDate', toDate.toISOString().split('T')[0]);

      const url = params.toString() ? `${API_ENDPOINTS.TRANSACTION.STATEMENT}?${params}` : API_ENDPOINTS.TRANSACTION.STATEMENT;
      const response = await api.get<ApiResponse<TransactionReadDto[]>>(url);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      // Error fetching account statement
      if (error.response?.status === 401) {
        throw new Error('Please log in to view your transactions');
      }
      if (error.response?.status === 400) {
        // Handle case where user has no approved accounts - return empty array instead of throwing
        return [];
      }
      return [];
    }
  },

  async downloadReceipt(transactionId: number): Promise<Blob> {
    const payload = { transactionId };
    const response = await api.post(API_ENDPOINTS.TRANSACTION.RECEIPT, payload, {
      responseType: 'blob',
      headers: { 'Content-Type': CONTENT_TYPES.JSON },
    });
    return response.data;
  },

  async downloadPdfStatement(fromDate?: Date, toDate?: Date): Promise<Blob> {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate.toISOString().split('T')[0]);
    if (toDate) params.append('toDate', toDate.toISOString().split('T')[0]);

    const response = await api.get(`${API_ENDPOINTS.TRANSACTION.PDF_STATEMENT}?${params}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async billPayment(data: BillPaymentDto): Promise<any> {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const response = await api.post<ApiResponse<any>>(API_ENDPOINTS.TRANSACTION.BILL_PAYMENT, formData, {
        headers: { 'Content-Type': CONTENT_TYPES.FORM_DATA },
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Bill payment failed');
    } catch (error: any) {
      // Bill payment error occurred
      
      // Handle specific validation errors
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        // Handle business rule violations
        if (errorData?.message) {
          throw new Error(errorData.message);
        }
        
        // Handle validation errors
        if (errorData?.errors) {
          const errorMessages = Object.values(errorData.errors).flat().join(', ');
          throw new Error(errorMessages);
        }
      }
      
      // Handle network or other errors
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.message || 'Bill payment failed');
    }
  },

  async loanPayment(data: LoanPaymentDto): Promise<any> {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const response = await api.post<ApiResponse<any>>(API_ENDPOINTS.TRANSACTION.LOAN_PAYMENT, formData, {
        headers: { 'Content-Type': CONTENT_TYPES.FORM_DATA },
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Loan payment failed');
    } catch (error: any) {
      // Loan payment error occurred
      
      // Handle specific validation errors
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        // Handle business rule violations
        if (errorData?.message) {
          throw new Error(errorData.message);
        }
        
        // Handle validation errors
        if (errorData?.errors) {
          const errorMessages = Object.values(errorData.errors).flat().join(', ');
          throw new Error(errorMessages);
        }
      }
      
      // Handle network or other errors
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.message || 'Loan payment failed');
    }
  },

  async investmentDeposit(data: InvestmentDepositDto): Promise<any> {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const response = await api.post<ApiResponse<any>>(API_ENDPOINTS.TRANSACTION.INVESTMENT_DEPOSIT, formData, {
        headers: { 'Content-Type': CONTENT_TYPES.FORM_DATA },
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Investment deposit failed');
    } catch (error: any) {
      // Investment deposit error occurred
      
      // Handle specific validation errors
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        // Handle business rule violations
        if (errorData?.message) {
          throw new Error(errorData.message);
        }
        
        // Handle validation errors
        if (errorData?.errors) {
          const errorMessages = Object.values(errorData.errors).flat().join(', ');
          throw new Error(errorMessages);
        }
      }
      
      // Handle network or other errors
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.message || 'Investment deposit failed');
    }
  },

  async getFilteredTransactions(filter: TransactionFilterDto): Promise<TransactionReadDto[]> {
    try {
      const formData = new FormData();
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const response = await api.post<ApiResponse<TransactionReadDto[]>>(API_ENDPOINTS.TRANSACTION.FILTER, formData, {
        headers: { 'Content-Type': CONTENT_TYPES.FORM_DATA },
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch filtered transactions');
    } catch (error: any) {
      // Filter transactions error occurred
      
      // Handle specific validation errors
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        // Handle business rule violations
        if (errorData?.message) {
          throw new Error(errorData.message);
        }
        
        // Handle validation errors
        if (errorData?.errors) {
          const errorMessages = Object.values(errorData.errors).flat().join(', ');
          throw new Error(errorMessages);
        }
      }
      
      // Handle network or other errors
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.message || 'Failed to fetch filtered transactions');
    }
  },

  async getAllTransactions(): Promise<TransactionReadDto[]> {
    const requestFn = async () => {
      const response = await api.get<ApiResponse<TransactionReadDto[]>>(API_ENDPOINTS.TRANSACTION.ALL);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch all transactions');
    };

    return await apiOptimizer.cached(CACHE_KEYS.ALL_TRANSACTIONS, requestFn, 3); // 3 minute cache
  },

  async approveTransactionByBranchManager(id: number): Promise<void> {
    const response = await api.put<ApiResponse<null>>(API_ENDPOINTS.TRANSACTION.APPROVE_BRANCH_MANAGER(id));
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to approve transaction');
    }
  },

  async reverseTransaction(id: number, reason: string): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('reason', reason);

      const response = await api.put<ApiResponse<null>>(API_ENDPOINTS.TRANSACTION.REVERSE(id), formData, {
        headers: { 'Content-Type': CONTENT_TYPES.FORM_DATA },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to reverse transaction');
      }
    } catch (error: any) {
      // Reverse transaction error occurred
      
      // Handle specific validation errors
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        // Handle business rule violations
        if (errorData?.message) {
          throw new Error(errorData.message);
        }
        
        // Handle validation errors
        if (errorData?.errors) {
          const errorMessages = Object.values(errorData.errors).flat().join(', ');
          throw new Error(errorMessages);
        }
      }
      
      // Handle network or other errors
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.message || 'Failed to reverse transaction');
    }
  },

  async fixFailedTransactions(): Promise<{ fixedCount: number }> {
    try {
      const response = await api.post<ApiResponse<{ fixedCount: number }>>(API_ENDPOINTS.TRANSACTION.FIX_FAILED);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fix transactions');
    } catch (error: any) {
      // Fix transactions error occurred
      
      // Handle specific validation errors
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        // Handle business rule violations
        if (errorData?.message) {
          throw new Error(errorData.message);
        }
        
        // Handle validation errors
        if (errorData?.errors) {
          const errorMessages = Object.values(errorData.errors).flat().join(', ');
          throw new Error(errorMessages);
        }
      }
      
      // Handle network or other errors
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.message || 'Failed to fix transactions');
    }
  },
};

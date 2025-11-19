import api from '@/api/axios';
import { ApiResponse, TransactionType, TransactionStatus } from '@/types';
import { validationGuard } from '@/utils/validationGuard';
import { apiOptimizer } from '@/utils/apiOptimizer';

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
    const cacheKey = `user_transactions_${fromDate?.toISOString().split('T')[0] || 'all'}_${toDate?.toISOString().split('T')[0] || 'all'}_${accountNumber || 'all'}`;
    
    const requestFn = async () => {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate.toISOString().split('T')[0]);
      if (toDate) params.append('toDate', toDate.toISOString().split('T')[0]);
      if (accountNumber) params.append('accountNumber', accountNumber);

      const url = params.toString() ? `/transaction/user-history?${params}` : '/transaction/user-history';
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
      const response = await api.get<ApiResponse<DashboardTransactionSummary>>('/transaction/dashboard-summary');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch dashboard summary');
    };

    try {
      return await apiOptimizer.cached('dashboard_transaction_summary', requestFn, 2); // 2 minute cache
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

      const response = await api.post<ApiResponse<any>>('/transaction/deposit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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

      const response = await api.post<ApiResponse<any>>('/transaction/withdraw', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
      throw new Error('Source and destination accounts cannot be the same');
    }

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const response = await api.post<ApiResponse<any>>('/transaction/transfer', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
      const response = await api.get<ApiResponse<TransactionReadDto[]>>('/transaction/pending-approval');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch pending transactions');
    };

    return await apiOptimizer.cached('pending_transactions', requestFn, 1); // 1 minute cache
  },

  async getPendingTransactionsByBranch(branchId: number): Promise<TransactionReadDto[]> {
    const response = await api.get<ApiResponse<TransactionReadDto[]>>(`/transaction/pending-approval/branch/${branchId}`);
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

      const response = await api.put<ApiResponse<null>>(`/transaction/approve/${id}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to approve transaction');
      }
    };

    await apiOptimizer.dedupe(`approve_transaction_${id}`, requestFn);
    // Clear related caches
    apiOptimizer.clearCache('pending_transactions');
    apiOptimizer.clearCache('all_transactions');
  },

  async getAccountStatement(fromDate?: Date, toDate?: Date): Promise<TransactionReadDto[]> {
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate.toISOString().split('T')[0]);
      if (toDate) params.append('toDate', toDate.toISOString().split('T')[0]);

      const url = params.toString() ? `/transaction/statement?${params}` : '/transaction/statement';
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
    const response = await api.post('/transaction/receipt', payload, {
      responseType: 'blob',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  async downloadPdfStatement(fromDate?: Date, toDate?: Date): Promise<Blob> {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate.toISOString().split('T')[0]);
    if (toDate) params.append('toDate', toDate.toISOString().split('T')[0]);

    const response = await api.get(`/transaction/pdf-statement?${params}`, {
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

      const response = await api.post<ApiResponse<any>>('/transaction/bill-payment', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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

      const response = await api.post<ApiResponse<any>>('/transaction/loan-payment', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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

      const response = await api.post<ApiResponse<any>>('/transaction/investment-deposit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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

      const response = await api.post<ApiResponse<TransactionReadDto[]>>('/transaction/filter', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
      const response = await api.get<ApiResponse<TransactionReadDto[]>>('/transaction/all');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch all transactions');
    };

    return await apiOptimizer.cached('all_transactions', requestFn, 3); // 3 minute cache
  },

  async approveTransactionByBranchManager(id: number): Promise<void> {
    const response = await api.put<ApiResponse<null>>(`/transaction/approve-branch-manager/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to approve transaction');
    }
  },

  async reverseTransaction(id: number, reason: string): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('reason', reason);

      const response = await api.put<ApiResponse<null>>(`/transaction/reverse/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
      const response = await api.post<ApiResponse<{ fixedCount: number }>>('/transaction/fix-failed-transactions');
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

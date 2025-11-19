import api from '@/api/axios';
import { ApiResponse, AccountType, AccountStatus, CreateAccountDto } from '@/types';
import { dataCache, CACHE_KEYS } from '@/utils/dataCache';
import { validationGuard } from '@/utils/validationGuard';
import { getErrorMessage } from '@/utils/errorHandler';
import { apiOptimizer } from '@/utils/apiOptimizer';

export interface AccountReadDto {
  id: number;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  status: AccountStatus;
  branchId: number;
  userId: number;
  openedDate: string;
  isActive: boolean;
  lastTransactionDate?: string;
  createdAt?: string;
  updatedAt?: string;
  userName: string;
  userEmail: string;
  branchName: string;

}

export interface VerifyAccountDto {
  isApproved: boolean;
  remarks?: string;
}

export interface AccountUpdateDto {
  nomineeName?: string;
  nomineeRelation?: string;
  nomineePhone?: string;
}

export const accountService = {
  // Helper method to get accounts from admin context if available
  getAccountsFromAdminContext: (adminAccounts: any[]) => {
    return adminAccounts;
  },
  async createAccount(data: CreateAccountDto): Promise<AccountReadDto> {
    // Frontend validation - NO API call if this fails
    validationGuard.validateAccountCreation(data);

    try {
      const formData = new FormData();
      
      // Handle file uploads properly
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await api.post<ApiResponse<AccountReadDto>>('/account/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success && response.data.data) {
        // Clear cache when new account is created
        dataCache.clear(CACHE_KEYS.MY_ACCOUNTS);
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create account');
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getMyAccounts(useCache: boolean = true): Promise<AccountReadDto[]> {
    const requestFn = async () => {
      const response = await api.get<ApiResponse<AccountReadDto[]>>('/account/my-accounts');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch accounts');
    };

    try {
      if (useCache) {
        return await apiOptimizer.cached('my_accounts', requestFn, 5); // 5 minute cache
      } else {
        return await apiOptimizer.dedupe('my_accounts', requestFn);
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Failed to fetch accounts');
    }
  },

  async getAllAccounts(): Promise<AccountReadDto[]> {
    const requestFn = async () => {
      const response = await api.get<ApiResponse<AccountReadDto[]>>('/account');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch all accounts');
    };

    try {
      return await apiOptimizer.cached('all_accounts', requestFn, 3); // 3 minute cache
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Failed to fetch all accounts');
    }
  },

  async getAccountById(id: number): Promise<AccountReadDto> {
    const response = await api.get<ApiResponse<AccountReadDto>>(`/account/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch account');
  },

  async getPendingAccounts(): Promise<AccountReadDto[]> {
    const requestFn = async () => {
      const response = await api.get<ApiResponse<AccountReadDto[]>>('/account/pending');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch pending accounts');
    };

    return await apiOptimizer.cached('pending_accounts', requestFn, 1); // 1 minute cache
  },

  async getPendingAccountsByBranch(branchId: number): Promise<AccountReadDto[]> {
    const response = await api.get<ApiResponse<AccountReadDto[]>>(`/account/pending/branch/${branchId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch pending accounts');
  },

  async verifyAccount(accountId: number, data: VerifyAccountDto): Promise<void> {
    const requestFn = async () => {
      const formData = new FormData();
      formData.append('isApproved', data.isApproved.toString());
      if (data.remarks) {
        formData.append('remarks', data.remarks);
      }

      const response = await api.put<ApiResponse<null>>(`/account/verify/${accountId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to verify account');
      }
    };

    try {
      await apiOptimizer.dedupe(`verify_account_${accountId}`, requestFn);
      // Clear related caches
      apiOptimizer.clearCache('pending_accounts');
      apiOptimizer.clearCache('all_accounts');
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Failed to verify account');
    }
  },

  async verifyAccountByBranchManager(accountId: number, data: VerifyAccountDto): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('isApproved', data.isApproved.toString());
      if (data.remarks) {
        formData.append('remarks', data.remarks);
      }

      const response = await api.put<ApiResponse<null>>(`/account/verify-branch/${accountId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to verify account');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Failed to verify account');
    }
  },

  async updateAccount(id: number, data: AccountUpdateDto): Promise<AccountReadDto> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await api.put<ApiResponse<AccountReadDto>>(`/account/request-profile-update/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update account');
  },

  async deleteAccount(id: number): Promise<void> {
    const response = await api.delete<ApiResponse<null>>(`/account/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete account');
    }
  },

  async markAccountVerified(id: number, remarks?: string): Promise<void> {
    const payload = {
      accountId: id,
      remarks: remarks || undefined
    };
    
    const response = await api.put<ApiResponse<null>>('/account/mark-verified', payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to verify account');
    }
  },

  async closeAccount(id: number, reason?: string): Promise<void> {
    const payload = {
      accountId: id,
      reason: reason || undefined
    };
    
    const response = await api.put<ApiResponse<null>>('/account/close', payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to close account');
    }
  },

  async rejectAccount(id: number, reason?: string): Promise<void> {
    const payload = {
      accountId: id,
      reason: reason || undefined
    };
    
    const response = await api.put<ApiResponse<null>>('/account/reject', payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to reject account');
    }
  },

  async markAccountDormant(id: number, reason?: string): Promise<void> {
    const payload = {
      accountId: id,
      reason: reason || undefined
    };
    
    const response = await api.put<ApiResponse<null>>('/account/mark-dormant', payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to mark account as dormant');
    }
  },

  async updateAccountStatus(id: number, status: AccountStatus): Promise<void> {
    const payload = {
      accountId: id,
      status: status
    };
    
    const response = await api.put<ApiResponse<null>>('/account/update-status', payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update account status');
    }
  },
};

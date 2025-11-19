import api from '@/api/axios';
import { ApiResponse } from '@/types';

// Branch Manager Dashboard Types
export interface BranchOverview {
  branchId: number;
  totalAccounts: number;
  activeAccounts: number;
  pendingAccounts: number;
  totalBalance: number;
  todayTransactions: number;
  monthlyTransactions: number;
  pendingApprovals: number;
}

export interface BranchDailyActivity {
  date: string;
  transactions: number;
  volume: number;
  deposits: number;
  withdrawals: number;
  transfers: number;
}

export interface BranchCustomerSummary {
  customerId: number;
  customerName: string;
  accountCount: number;
  totalBalance: number;
  accountTypes: string[];
  lastActivity: string;
}

export interface BranchInfo {
  branchId: number;
  branchName: string;
  branchCode: string;
  branchType: string;
  address: string;
}

export interface PendingAccount {
  id: number;
  accountNumber: string;
  userId: number;
  userName: string;
  accountType: number;
  balance: number;
  branchId: number;
  branchName: string;
  status: number;
  openedDate: string;
}

export interface PendingTransaction {
  id: number;
  transactionType: number;
  amount: number;
  fromAccountId?: number;
  toAccountId?: number;
  description: string;
  transactionDate: string;
  status: number;
}

export interface BranchManagerWorkspaceData {
  branchInfo: BranchInfo;
  branchOverview: BranchOverview;
  dailyActivity: BranchDailyActivity[];
  customerSummary: BranchCustomerSummary[];
  recentTransactions: any[];
  pendingItems: {
    accounts: PendingAccount[];
    transactions: PendingTransaction[];
  };
}

export const branchManagerService = {
  // Consolidated method to get all branch manager workspace data
  async getBranchManagerWorkspace(): Promise<BranchManagerWorkspaceData> {
    const response = await api.get<ApiResponse<BranchManagerWorkspaceData>>('/branch/workspace');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch branch manager workspace data');
  },

  // Individual methods for specific data (kept for backward compatibility)
  async getBranchOverview(): Promise<BranchOverview> {
    const response = await api.get<ApiResponse<BranchOverview>>('/branch/analytics/branch-overview');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch branch overview');
  },

  async getBranchDailyActivity(days: number = 7): Promise<BranchDailyActivity[]> {
    const response = await api.get<ApiResponse<BranchDailyActivity[]>>(`/branch/analytics/daily-activity?days=${days}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch branch daily activity');
  },

  async getBranchCustomerSummary(): Promise<BranchCustomerSummary[]> {
    const response = await api.get<ApiResponse<BranchCustomerSummary[]>>('/branch/analytics/customer-summary');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch branch customer summary');
  },

  // Quick stats for dashboard cards
  async getBranchQuickStats(): Promise<{
    totalAccounts: number;
    pendingApprovals: number;
    todayTransactions: number;
    monthlyVolume: number;
  }> {
    const response = await api.get<ApiResponse<any>>('/branch/workspace/quick-stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch branch quick stats');
  }
};
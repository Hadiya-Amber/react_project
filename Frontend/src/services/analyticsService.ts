import api from '@/api/axios';
import { ApiResponse } from '@/types';

// Admin Dashboard Types
export interface OverviewStats {
  totalBranches: number;
  totalCustomers: number;
  totalAccounts: number;
  pendingAccounts: number;
  totalDeposits: number;
  totalTransactions: number;
  pendingTransactions: number;
  monthlyTransactionVolume: number;
}

export interface BranchPerformance {
  branchId: number;
  branchName: string;
  branchCode: string;
  totalAccounts: number;
  activeAccounts: number;
  totalDeposits: number;
  transactionsThisMonth: number;
  transactionVolumeThisMonth: number;
}

export interface TransactionTrend {
  date: string;
  transactionCount: number;
  transactionVolume: number;
  depositCount: number;
  withdrawalCount: number;
  transferCount: number;
}

export interface AccountTypeDistribution {
  accountType: string;
  count: number;
  percentage: number;
  totalBalance: number;
}

export interface RecentActivity {
  activityType: string;
  description: string;
  timestamp: string;
  userName?: string;
  branchName?: string;
  amount?: number;
}

export interface AdminDashboardData {
  overviewStats: OverviewStats;
  branchPerformance: BranchPerformance[];
  transactionTrends: TransactionTrend[];
  accountTypeDistribution: AccountTypeDistribution[];
  recentActivities: RecentActivity[];
}



// Customer Dashboard Types
export interface PersonalInfo {
  fullName: string;
  email: string;
  totalAccounts: number;
  totalBalance: number;
}

export interface AccountSummary {
  accountId: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  status: string;
}

export interface RecentTransaction {
  transactionId: number;
  type: string;
  amount: number;
  date: string;
  description: string;
  status: string;
}

export interface CustomerMonthlyStats {
  transactionsThisMonth: number;
  spentThisMonth: number;
  receivedThisMonth: number;
}

export interface CustomerDashboardData {
  personalInfo: PersonalInfo;
  accountSummary: AccountSummary[];
  recentTransactions: RecentTransaction[];
  monthlyStats: CustomerMonthlyStats;
}

export interface CustomerCompleteDashboardData {
  personalInfo: PersonalInfo;
  accountSummary: AccountSummary[];
  recentTransactions: RecentTransaction[];
  monthlyStats: CustomerMonthlyStats;
  accountDetails: any[];
  profileData: any;
  minorAccountCheck: {
    userAge: number | null;
    hasMinorAccounts: boolean;
    isMinorAccountBlocked: boolean;
  };
}

// Customer Analytics Types
export interface CustomerFinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  currentBalance: number;
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
}

export interface CustomerMonthlyTrend {
  month: string;
  year: number;
  income: number;
  expenses: number;
}

export interface CustomerExpenseCategory {
  category: string;
  amount: number;
  transactionCount: number;
  percentage: number;
}

// Cache for customer dashboard data with AbortController
let customerDashboardCache: { data: any; timestamp: number } | null = null;
let customerCompleteCache: { data: any; timestamp: number } | null = null;
let currentCustomerRequest: AbortController | null = null;
let pendingCustomerRequest: Promise<CustomerCompleteDashboardData> | null = null;
const CUSTOMER_CACHE_DURATION = 30000; // 30 seconds

export const analyticsService = {
  // Admin Analytics
  async getAdminDashboardData(): Promise<AdminDashboardData> {
    const response = await api.get<ApiResponse<AdminDashboardData>>('/analytics/admin-dashboard');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch admin dashboard data');
  },

  async getAdminSuperDashboard(): Promise<any> {
    const response = await api.get<ApiResponse<any>>('/analytics/admin-super-dashboard');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch admin super dashboard data');
  },

  async getOverviewStats(): Promise<OverviewStats> {
    const response = await api.get<ApiResponse<OverviewStats>>('/analytics/overview-stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch overview stats');
  },

  async getBranchPerformance(): Promise<BranchPerformance[]> {
    const response = await api.get<ApiResponse<BranchPerformance[]>>('/analytics/branch-performance');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch branch performance');
  },

  async getRecentActivities(count: number = 10): Promise<RecentActivity[]> {
    const response = await api.get<ApiResponse<RecentActivity[]>>(`/analytics/recent-activities?count=${count}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch recent activities');
  },

  async getAdminTransactionTrends(days: number = 30): Promise<any[]> {
    const response = await api.get(`/admin/analytics/transaction-trends?days=${days}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to fetch transaction trends');
  },

  async getAdminAccountDistribution(): Promise<any[]> {
    const response = await api.get('/admin/analytics/account-type-distribution');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to fetch account distribution');
  },

  async getAdminMonthlyRevenue(months: number = 12): Promise<any[]> {
    const response = await api.get(`/admin/analytics/monthly-revenue?months=${months}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to fetch monthly revenue');
  },

  async getAdminUserGrowth(months: number = 12): Promise<any[]> {
    const response = await api.get(`/admin/analytics/user-growth?months=${months}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to fetch user growth');
  },

  async getAdminTopCustomers(limit: number = 10): Promise<any[]> {
    const response = await api.get(`/admin/analytics/top-customers?limit=${limit}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to fetch top customers');
  },

  async getAdminBranchPerformance(): Promise<any[]> {
    const response = await api.get('/admin/analytics/branch-performance');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to fetch branch performance');
  },

  // Combined method that uses super dashboard for everything
  async getCompleteAdminData(): Promise<any> {
    return this.getAdminSuperDashboard();
  },



  // Customer Analytics
  async getCustomerDashboardData(): Promise<CustomerDashboardData> {
    // Check cache first
    if (customerDashboardCache && Date.now() - customerDashboardCache.timestamp < CUSTOMER_CACHE_DURATION) {
      return customerDashboardCache.data;
    }

    const response = await api.get<ApiResponse<CustomerDashboardData>>('/analytics/customer-dashboard');
    if (response.data.success && response.data.data) {
      // Cache the response
      customerDashboardCache = {
        data: response.data.data,
        timestamp: Date.now()
      };
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch customer dashboard data');
  },

  async getCustomerCompleteDashboardData(): Promise<CustomerCompleteDashboardData> {
    // Check cache first
    if (customerCompleteCache && Date.now() - customerCompleteCache.timestamp < CUSTOMER_CACHE_DURATION) {
      return customerCompleteCache.data;
    }

    // Return existing promise if request is already in progress
    if (pendingCustomerRequest) {
      return pendingCustomerRequest;
    }

    // Cancel previous request if still pending
    if (currentCustomerRequest) {
      currentCustomerRequest.abort();
    }

    currentCustomerRequest = new AbortController();
    
    // Create and store the pending request promise
    pendingCustomerRequest = this.fetchCustomerCompleteDashboard();
    
    try {
      const result = await pendingCustomerRequest;
      return result;
    } finally {
      // Clean up the pending request
      pendingCustomerRequest = null;
      currentCustomerRequest = null;
    }
  },

  async fetchCustomerCompleteDashboard(): Promise<CustomerCompleteDashboardData> {
    try {
      const response = await api.get<ApiResponse<CustomerCompleteDashboardData>>('/analytics/customer-complete-dashboard', {
        signal: currentCustomerRequest?.signal,
        timeout: 6000
      });
      
      if (response.data.success && response.data.data) {
        // Cache the response
        customerCompleteCache = {
          data: response.data.data,
          timestamp: Date.now()
        };
        
        // Update CustomerContext if available
        if ((window as any).__customerContextUpdate) {
          (window as any).__customerContextUpdate(response.data.data);
        }
        
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch complete customer dashboard data');
    } catch (error: any) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        // Request was cancelled, return cached data if available
        if (customerCompleteCache) {
          return customerCompleteCache.data;
        }
        // Return empty fallback data for cancelled requests
        return {
          personalInfo: { fullName: '', email: '', totalAccounts: 0, totalBalance: 0 },
          accountSummary: [],
          recentTransactions: [],
          monthlyStats: { transactionsThisMonth: 0, spentThisMonth: 0, receivedThisMonth: 0 },
          accountDetails: [],
          profileData: null,
          minorAccountCheck: { userAge: null, hasMinorAccounts: false, isMinorAccountBlocked: false }
        };
      }
      throw error;
    }
  },

  async getPersonalInfo(): Promise<PersonalInfo> {
    const response = await api.get<ApiResponse<PersonalInfo>>('/analytics/personal-info');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch personal info');
  },

  async getAccountSummary(): Promise<AccountSummary[]> {
    const response = await api.get<ApiResponse<AccountSummary[]>>('/analytics/account-summary');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch account summary');
  },

  async getCustomerTransactions(count: number = 10): Promise<RecentTransaction[]> {
    const response = await api.get<ApiResponse<RecentTransaction[]>>(`/analytics/customer-transactions?count=${count}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch customer transactions');
  },

  async getCustomerMonthlyStats(): Promise<CustomerMonthlyStats> {
    const response = await api.get<ApiResponse<CustomerMonthlyStats>>('/analytics/customer-monthly-stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch customer monthly stats');
  },

  // Customer Analytics Methods
  async getCustomerFinancialSummary(months: number = 6): Promise<CustomerFinancialSummary> {
    const response = await api.get<ApiResponse<CustomerFinancialSummary>>(`/analytics/customer-financial-summary?months=${months}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch customer financial summary');
  },

  async getCustomerMonthlyTrends(months: number = 6): Promise<CustomerMonthlyTrend[]> {
    const response = await api.get<ApiResponse<CustomerMonthlyTrend[]>>(`/analytics/customer-monthly-trends?months=${months}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch customer monthly trends');
  },

  async getCustomerExpenseCategories(months: number = 6): Promise<CustomerExpenseCategory[]> {
    const response = await api.get<ApiResponse<CustomerExpenseCategory[]>>(`/analytics/customer-expense-categories?months=${months}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch customer expense categories');
  },

  // General Analytics (used by all roles)
  async getTransactionTrends(days: number = 30): Promise<TransactionTrend[]> {
    const response = await api.get<ApiResponse<TransactionTrend[]>>(`/analytics/transaction-trends?days=${days}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch transaction trends');
  },

  async getAccountStatistics(): Promise<AccountTypeDistribution[]> {
    const response = await api.get<ApiResponse<AccountTypeDistribution[]>>('/analytics/account-statistics');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch account statistics');
  },

  // Branch Manager Analytics (deprecated - use branchManagerService instead)
  async getBranchManagerDashboardData(): Promise<any> {
    console.warn('getBranchManagerDashboardData is deprecated. Use branchManagerService.getBranchManagerWorkspace() instead.');
    const response = await api.get<ApiResponse<any>>('/branch/workspace');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch branch manager dashboard data');
  },

  async getBranchOverview(): Promise<any> {
    console.warn('getBranchOverview is deprecated. Use branchManagerService.getBranchOverview() instead.');
    const response = await api.get<ApiResponse<any>>('/branch/analytics/branch-overview');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch branch overview');
  },

  async getBranchDailyActivity(days: number = 7): Promise<any[]> {
    console.warn('getBranchDailyActivity is deprecated. Use branchManagerService.getBranchDailyActivity() instead.');
    const response = await api.get<ApiResponse<any[]>>(`/branch/analytics/daily-activity?days=${days}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch branch daily activity');
  },

  async getBranchCustomerSummary(): Promise<any[]> {
    console.warn('getBranchCustomerSummary is deprecated. Use branchManagerService.getBranchCustomerSummary() instead.');
    const response = await api.get<ApiResponse<any[]>>('/branch/analytics/customer-summary');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch branch customer summary');
  },
};

// Clear customer caches
export const clearCustomerDashboardCache = () => {
  customerDashboardCache = null;
  customerCompleteCache = null;
  pendingCustomerRequest = null;
  if (currentCustomerRequest) {
    currentCustomerRequest.abort();
    currentCustomerRequest = null;
  }
};

// Export a method to get all admin data in one call
export const getCompleteAdminDashboard = () => analyticsService.getAdminSuperDashboard();

import api from '@/api/axios';
import { ApiResponse, User } from '@/types';

export enum BranchType {
  Main = 0,
  Sub = 1,
  Regional = 2
}

export interface Branch {
  id: number;
  branchName: string;
  branchCode: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  branchType: BranchType;
  isMainBranch: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BranchManager {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  designation?: string;
  employeeCode?: string;
  joinDate?: string;
  status: number;
  isActive: boolean;
  lastLoginDate?: string;
}

export interface BranchStatistics {
  totalAccounts: number;
  activeAccounts: number;
  pendingAccounts: number;
  totalDeposits: number;
  totalCustomers: number;
  pendingTransactions: number;
  monthlyTransactionVolume: number;
  transactionsThisMonth: number;
}

export interface BranchDetails extends Branch {
  branchManager?: BranchManager;
  statistics: BranchStatistics;
  recentActivities?: any[];
}

export interface CreateBranchDto {
  branchName: string;
  branchCode: string;
  address: string;
  city: string;
  state: string;
  ifscCode: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  branchType: BranchType;
  isActive?: boolean;
}

// Cache and deduplication for branch data
let branchCache: { data: Branch[]; timestamp: number } | null = null;
let pendingBranchRequest: Promise<Branch[]> | null = null;
const BRANCH_CACHE_DURATION = 60000; // 1 minute

export const branchService = {
  async getAllBranches(): Promise<Branch[]> {
    // Check cache first
    if (branchCache && Date.now() - branchCache.timestamp < BRANCH_CACHE_DURATION) {
      return branchCache.data;
    }

    // Return existing promise if request is already in progress
    if (pendingBranchRequest) {
      return pendingBranchRequest;
    }

    // Create and store the pending request promise
    pendingBranchRequest = this.fetchAllBranches();
    
    try {
      const result = await pendingBranchRequest;
      return result;
    } finally {
      // Clean up the pending request
      pendingBranchRequest = null;
    }
  },

  async fetchAllBranches(): Promise<Branch[]> {
    // Check sessionStorage first for cross-component caching
    const cachedBranches = sessionStorage.getItem('branches');
    const cacheTime = sessionStorage.getItem('branchesTimestamp');
    const now = Date.now();
    
    if (cachedBranches && cacheTime && (now - parseInt(cacheTime)) < 600000) {
      const branches = JSON.parse(cachedBranches);
      // Update memory cache too
      branchCache = { data: branches, timestamp: parseInt(cacheTime) };
      return branches;
    }

    const response = await api.get<ApiResponse<Branch[]>>('/branch/all');
    if (response.data.success && response.data.data) {
      // Cache in both memory and sessionStorage
      branchCache = {
        data: response.data.data,
        timestamp: now
      };
      sessionStorage.setItem('branches', JSON.stringify(response.data.data));
      sessionStorage.setItem('branchesTimestamp', now.toString());
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch branches');
  },

  async getBranchById(id: number): Promise<Branch> {
    const response = await api.get<ApiResponse<any>>(`/branch/${id}`);
    if (response.data.success && response.data.data) {
      const data = response.data.data;
      return {
        ...data,
        ifscCode: data.ifscCode || data.IFSCCode,
        phoneNumber: data.phoneNumber || data.PhoneNumber,
        email: data.email || data.Email,
        postalCode: data.postalCode || data.PostalCode
      };
    }
    throw new Error(response.data.message || 'Branch not found');
  },

  async getBranchDetails(id: number): Promise<BranchDetails> {
    const response = await api.get<ApiResponse<any>>(`/branch/${id}/details`);
    if (response.data.success && response.data.data) {
      // Map the backend response to match frontend interface
      const data = response.data.data;
      return {
        ...data,
        ifscCode: data.ifscCode || data.IFSCCode, // Handle case differences
        phoneNumber: data.phoneNumber || data.PhoneNumber,
        email: data.email || data.Email,
        postalCode: data.postalCode || data.PostalCode,
        branchManager: data.branchManager ? {
          ...data.branchManager,
          fullName: data.branchManager.fullName || data.branchManager.FullName,
          email: data.branchManager.email || data.branchManager.Email,
          phoneNumber: data.branchManager.phoneNumber || data.branchManager.PhoneNumber,
          designation: data.branchManager.designation || data.branchManager.Designation,
          employeeCode: data.branchManager.employeeCode || data.branchManager.EmployeeCode,
          joinDate: data.branchManager.joinDate || data.branchManager.JoinDate,
          status: data.branchManager.status || data.branchManager.Status,
          isActive: data.branchManager.isActive !== undefined ? data.branchManager.isActive : data.branchManager.IsActive,
          lastLoginDate: data.branchManager.lastLoginDate || data.branchManager.LastLoginDate
        } : undefined,
        statistics: {
          totalAccounts: data.statistics?.totalAccounts || data.statistics?.TotalAccounts || 0,
          activeAccounts: data.statistics?.activeAccounts || data.statistics?.ActiveAccounts || 0,
          pendingAccounts: data.statistics?.pendingAccounts || data.statistics?.PendingAccounts || 0,
          totalDeposits: data.statistics?.totalDeposits || data.statistics?.TotalDeposits || 0,
          totalCustomers: data.statistics?.totalCustomers || data.statistics?.TotalCustomers || 0,
          pendingTransactions: data.statistics?.pendingTransactions || data.statistics?.PendingTransactions || 0,
          monthlyTransactionVolume: data.statistics?.monthlyTransactionVolume || data.statistics?.MonthlyTransactionVolume || 0,
          transactionsThisMonth: data.statistics?.transactionsThisMonth || data.statistics?.TransactionsThisMonth || 0
        }
      };
    }
    throw new Error(response.data.message || 'Branch details not found');
  },

  async createBranch(data: CreateBranchDto): Promise<Branch> {
    const formData = new FormData();
    formData.append('branchName', data.branchName);
    formData.append('branchCode', data.branchCode);
    formData.append('address', data.address);
    formData.append('city', data.city);
    formData.append('state', data.state);
    formData.append('ifscCode', data.ifscCode);
    formData.append('postalCode', data.postalCode);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('email', data.email);
    formData.append('branchType', data.branchType.toString());
    formData.append('isActive', 'true'); // Set new branches as active by default
    
    const response = await api.post<ApiResponse<Branch>>('/branch/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create branch');
  },

  async updateBranch(id: number, data: Partial<CreateBranchDto>): Promise<Branch> {
    const response = await api.put<ApiResponse<Branch>>(`/branch/${id}`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update branch');
  },

  async updateBranchWithForm(id: number, data: CreateBranchDto): Promise<Branch> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await api.put<ApiResponse<Branch>>(`/branch/${id}/update`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update branch');
  },

  async getBranchesByType(branchType: BranchType): Promise<Branch[]> {
    const response = await api.get<ApiResponse<Branch[]>>(`/branch/type/${branchType}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch branches by type');
  },

  async getBranchAccounts(branchId: number): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(`/branch/${branchId}/accounts`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch branch accounts');
  },

  async deleteBranch(id: number): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/branch/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete branch');
    }
  },

  async toggleBranchStatus(id: number): Promise<Branch> {
    const response = await api.patch<ApiResponse<Branch>>(`/branch/${id}/toggle-status`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to toggle branch status');
  },

  async checkBranchManagerExists(branchId: number): Promise<boolean> {
    try {
      const response = await api.get<ApiResponse<{ hasBranchManager: boolean }>>(`/branch/${branchId}/manager-status`);
      return response.data.data?.hasBranchManager || false;
    } catch (err) {
      return false;
    }
  },

  async getBranchManagers(): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>('/branch/managers');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch branch managers');
  },
};

// Clear branch cache
export const clearBranchCache = () => {
  branchCache = null;
  pendingBranchRequest = null;
  sessionStorage.removeItem('branches');
  sessionStorage.removeItem('branchesTimestamp');
};

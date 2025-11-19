import api from '@/api/axios';
import { ApiResponse } from '@/types';
import { UserRole, Gender } from './userService';

export interface BranchManager {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  branchId: number;
  isActive: boolean;
  designation: string;
  joinDate: string;
  address?: string;
  dateOfBirth: string;
  gender: Gender;
}

export interface UpdateEmployeeDto {
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  dateOfBirth: string | Date;
  gender: Gender;
  branchId: number;
  designation?: string;
  isActive?: boolean;
}

export interface ResetPasswordResponse {
  tempPassword: string;
  message: string;
}

// Cache for admin dashboard data with AbortController
let adminDashboardCache: { data: any; timestamp: number } | null = null;
let currentRequest: AbortController | null = null;
const CACHE_DURATION = 60000; // 60 seconds

export const adminService = {
  // Complete Admin Dashboard - Single API call with request cancellation
  async getCompleteAdminDashboard(force: boolean = false): Promise<any> {
    // Check cache first
    if (!force && adminDashboardCache && Date.now() - adminDashboardCache.timestamp < CACHE_DURATION) {
      return adminDashboardCache.data;
    }

    // Cancel previous request if still pending
    if (currentRequest) {
      currentRequest.abort();
    }

    currentRequest = new AbortController();
    
    try {
      const response = await api.get<ApiResponse<any>>('/admin/dashboard', {
        signal: currentRequest.signal,
        timeout: 5000 // 5 second timeout
      });
      
      if (response.data.success && response.data.data) {
        // Cache the response
        adminDashboardCache = {
          data: response.data.data,
          timestamp: Date.now()
        };
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch admin dashboard');
    } catch (error: any) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        // Request was cancelled, return cached data if available
        if (adminDashboardCache) {
          return adminDashboardCache.data;
        }
        throw new Error('Request cancelled');
      }
      throw error;
    } finally {
      currentRequest = null;
    }
  },

  // Clear cache when data is updated
  clearAdminDashboardCache(): void {
    adminDashboardCache = null;
    // Cancel any pending requests
    if (currentRequest) {
      currentRequest.abort();
      currentRequest = null;
    }
  },

  // Branch Management - Consolidated under dashboard
  async updateBranch(id: number, data: any): Promise<void> {
    const requestData = {
      action: 'update',
      branchId: id,
      data: {
        BranchName: data.branchName,
        BranchCode: data.branchCode,
        Address: data.address,
        City: data.city,
        State: data.state,
        IFSCCode: data.ifscCode,
        PostalCode: data.postalCode,
        PhoneNumber: data.phoneNumber,
        Email: data.email,
        BranchType: data.branchType,
        IsActive: data.isActive
      }
    };
    
    const response = await api.post<ApiResponse<any>>('/admin/dashboard', requestData);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update branch');
    }
    this.clearAdminDashboardCache();
  },

  async deleteBranch(id: number): Promise<void> {
    const requestData = {
      action: 'delete',
      branchId: id
    };
    
    const response = await api.post<ApiResponse<any>>('/admin/dashboard', requestData);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete branch');
    }
    this.clearAdminDashboardCache();
  },

  // Branch Manager Management
  async getAllBranchManagers(): Promise<BranchManager[]> {
    const response = await api.get<ApiResponse<BranchManager[]>>('/admin/branch-managers');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch branch managers');
  },

  async getBranchManagerById(id: number): Promise<BranchManager> {
    const response = await api.get<ApiResponse<BranchManager>>(`/admin/branch-managers/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch branch manager');
  },

  async updateBranchManager(id: number, data: UpdateEmployeeDto): Promise<BranchManager> {
    const requestData = {
      action: 'updateManager',
      managerId: id,
      data: data
    };
    
    const response = await api.post<ApiResponse<any>>('/admin/dashboard', requestData);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update branch manager');
    }
    this.clearAdminDashboardCache();
    return {} as BranchManager; // Return empty object since we're clearing cache
  },

  async deleteBranchManager(id: number): Promise<void> {
    const response = await api.delete<ApiResponse<null>>(`/admin/branch-managers/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete branch manager');
    }
  },

  async removeBranchManager(id: number): Promise<void> {
    const requestData = {
      action: 'removeManager',
      managerId: id
    };
    
    const response = await api.post<ApiResponse<any>>('/admin/dashboard', requestData);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to remove branch manager');
    }
    this.clearAdminDashboardCache();
  },

  async resetBranchManagerPassword(id: number): Promise<ResetPasswordResponse> {
    const requestData = {
      action: 'resetPassword',
      managerId: id
    };
    
    const response = await api.post<ApiResponse<any>>('/admin/dashboard', requestData);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to reset password');
    }
    
    return {
      tempPassword: response.data.data?.tempPassword || 'temp123',
      message: response.data.message || 'Password reset successfully'
    };
  },

  // Create Branch Manager - Consolidated under dashboard
  async createBranchManager(data: any): Promise<{ tempPassword: string }> {
    const requestData = {
      action: 'createManager',
      data: data
    };
    
    const response = await api.post<ApiResponse<any>>('/admin/dashboard', requestData);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create branch manager');
    }
    this.clearAdminDashboardCache();
    return {
      tempPassword: response.data.data?.tempPassword || 'temp123'
    };
  },

  // Create Branch - Consolidated under dashboard
  async createBranch(data: any): Promise<any> {
    const requestData = {
      action: 'createBranch',
      data: data
    };
    
    const response = await api.post<ApiResponse<any>>('/admin/dashboard', requestData);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create branch');
    }
    // Don't clear cache here - let parent component handle refresh timing
    return response.data.data;
  },

  // User Management - Use data from dashboard to avoid extra API calls
  async getAllUsers(): Promise<any[]> {
    // Try to get from dashboard data first
    try {
      const dashboardData = await this.getCompleteAdminDashboard();
      if (dashboardData?.accounts) {
        // Extract unique users from accounts
        const usersMap = new Map();
        dashboardData.accounts.forEach((account: any) => {
          if (!usersMap.has(account.userId)) {
            usersMap.set(account.userId, {
              id: account.userId,
              fullName: account.userName,
              email: account.userEmail,
              role: 'Customer',
              isActive: account.isActive
            });
          }
        });
        return Array.from(usersMap.values());
      }
    } catch (error) {
      // Fallback to direct API call if dashboard fails
    }

    // Fallback to direct API call with caching
    const requestFn = async () => {
      const response = await api.get<ApiResponse<any[]>>('/admin/users');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch users');
    };

    return await apiOptimizer.cached('admin_users', requestFn, 5);
  },

  // Get data from cache without making API calls
  getCachedDashboardData(): any | null {
    // This will return cached data if available, null otherwise
    try {
      return apiOptimizer['cache'].get(CACHE_KEYS.ADMIN_DASHBOARD)?.data || null;
    } catch {
      return null;
    }
  },

  // Check if data is currently being loaded
  isLoading(): boolean {
    return apiOptimizer['pendingRequests'].has(CACHE_KEYS.ADMIN_DASHBOARD);
  }
};

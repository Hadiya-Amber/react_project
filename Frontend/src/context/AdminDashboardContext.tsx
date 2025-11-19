import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, use, useRef } from 'react';
import { adminService } from '@/services/adminService';
import { useSingleRequest } from '@/hooks/useSingleRequest';

interface AdminDashboardData {
  analytics: any;
  branches: any[];
  accounts: any[];
  transactions: any[];
  branchManagerStatuses: any[];
}

interface AdminDashboardContextType {
  data: AdminDashboardData | null;
  loading: boolean;
  error: string | null;
  loadData: (force?: boolean) => Promise<void>;
  clearData: () => void;
  // Data getters to prevent individual API calls
  getAccounts: () => any[];
  getTransactions: () => any[];
  getBranches: () => any[];
  getAnalytics: () => any;
  getBranchManagerStatuses: () => any[];
  getBranchById: (id: number) => any;
  getBranchDetails: (id: number) => any;
}

const AdminDashboardContext = createContext<AdminDashboardContextType | undefined>(undefined);

interface AdminDashboardProviderProps {
  children: ReactNode;
}

export const AdminDashboardProvider: React.FC<AdminDashboardProviderProps> = ({ children }) => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { singleRequest, clearCache } = useSingleRequest();

  const loadData = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const completeData = await singleRequest(
        'admin_dashboard_load',
        () => adminService.getCompleteAdminDashboard(force),
        {
          cache: !force,
          cacheTTL: 2, // 2 minutes
          dedupe: true
        }
      );
      
      const newData = {
        analytics: completeData.analytics,
        branches: completeData.branches || [],
        accounts: completeData.accounts || [],
        transactions: completeData.transactions || [],
        branchManagerStatuses: completeData.branchManagerStatuses || []
      };
      
      setData(newData);
    } catch (err: any) {
      if (err.message !== 'Request cancelled') {
        setError(err.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  }, [singleRequest]);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
    clearCache('admin_dashboard');
    adminService.clearAdminDashboardCache();
  }, [clearCache]);

  // Auto-load data when provider mounts (only once)
  useEffect(() => {
    loadData(false); // Use cache if available
  }, [loadData]);

  // Data getters to prevent individual API calls
  const getAccounts = useCallback(() => data?.accounts || [], [data]);
  const getTransactions = useCallback(() => data?.transactions || [], [data]);
  const getBranches = useCallback(() => data?.branches || [], [data]);
  const getAnalytics = useCallback(() => data?.analytics || null, [data]);
  const getBranchManagerStatuses = useCallback(() => data?.branchManagerStatuses || [], [data]);
  const getBranchById = useCallback((id: number) => {
    return data?.branches?.find((branch: any) => branch.id === id) || null;
  }, [data]);
  const getBranchDetails = useCallback((id: number) => {
    const branch = data?.branches?.find((branch: any) => branch.id === id);
    return branch || null;
  }, [data]);

  const contextValue: AdminDashboardContextType = {
    data,
    loading,
    error,
    loadData,
    clearData,
    getAccounts,
    getTransactions,
    getBranches,
    getAnalytics,
    getBranchManagerStatuses,
    getBranchById,
    getBranchDetails
  };

  return (
    <AdminDashboardContext.Provider value={contextValue}>
      {children}
    </AdminDashboardContext.Provider>
  );
};

export const useAdminDashboard = (): AdminDashboardContextType => {
  const context = useContext(AdminDashboardContext);
  if (context === undefined) {
    throw new Error('useAdminDashboard must be used within an AdminDashboardProvider');
  }
  return context;
};

export default AdminDashboardContext;

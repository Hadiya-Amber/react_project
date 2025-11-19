import { useContext } from 'react';
import AdminDashboardContext from '@/context/AdminDashboardContext';

export const useAdminData = () => {
  const context = useContext(AdminDashboardContext);
  
  // Return helper functions to get data from admin context if available
  return {
    hasAdminContext: !!context,
    getAccounts: () => context?.data?.accounts || [],
    getTransactions: () => context?.data?.transactions || [],
    getBranches: () => context?.data?.branches || [],
    getAnalytics: () => context?.data?.analytics || null,
    getBranchManagerStatuses: () => context?.data?.branchManagerStatuses || [],
    isLoading: context?.loading || false,
    error: context?.error || null
  };
};
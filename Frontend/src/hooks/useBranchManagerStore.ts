import { useBranchManager } from '@/context/BranchManagerContext';

// Simple hook that doesn't trigger API calls automatically
export const useBranchManagerStore = () => {
  const { data, loading, error } = useBranchManager();
  
  return {
    data,
    loading,
    error,
    // Helper getters that don't trigger loads
    pendingAccounts: data?.pendingItems?.accounts || [],
    pendingTransactions: data?.pendingItems?.transactions || [],
    branchInfo: data?.branchInfo || null,
    isDataAvailable: !!data
  };
};
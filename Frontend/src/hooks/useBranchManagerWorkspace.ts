import { useContext, useEffect, useRef } from 'react';
import { BranchManagerContext } from '@/context/BranchManagerContext';

/**
 * Custom hook to access branch manager workspace data
 * Ensures all branch manager pages use the same cached data
 * without triggering additional API calls
 */
export const useBranchManagerWorkspace = () => {
  const context = useContext(BranchManagerContext);
  
  if (!context) {
    throw new Error('useBranchManagerWorkspace must be used within a BranchManagerProvider');
  }

  const { data, loading, error, loadData, clearData, refreshData, triggerLoad } = context;

  // Trigger loading when hook is first used (only once per component)
  const hasTriggered = useRef(false);
  useEffect(() => {
    if (!hasTriggered.current && !data && !loading) {
      hasTriggered.current = true;
      triggerLoad();
    }
  }, [data, loading, triggerLoad]);



  return {
    workspaceData: data,
    loading,
    error,
    loadData,
    clearData,
    refreshData,
    // Helper methods for common data access
    branchInfo: data?.branchInfo,
    branchOverview: data?.branchOverview,
    dailyActivity: data?.dailyActivity,
    customerSummary: data?.customerSummary,
    recentTransactions: data?.recentTransactions,
    pendingItems: data?.pendingItems,
  };
};
import { useState, useCallback, useRef, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { useSingleRequest } from './useSingleRequest';

interface LazyDashboardState {
  data: any | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

// Lazy dashboard hook that only loads data when needed
export const useLazyDashboard = () => {
  const [state, setState] = useState<LazyDashboardState>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
  });

  const { singleRequest, clearCache, cancelRequests } = useSingleRequest();
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cancelRequests('lazy_dashboard');
    };
  }, [cancelRequests]);

  const loadData = useCallback(async (force = false) => {
    if (!mountedRef.current) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const data = await singleRequest(
        'lazy_dashboard_load',
        () => adminService.getCompleteAdminDashboard(force),
        {
          cache: !force,
          cacheTTL: 2, // 2 minutes
          dedupe: true
        }
      );

      if (mountedRef.current) {
        setState({
          data,
          loading: false,
          error: null,
          lastUpdated: Date.now()
        });
      }
    } catch (error: any) {
      if (mountedRef.current && error.message !== 'Request cancelled') {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to load dashboard data'
        }));
      }
    }
  }, [singleRequest]);

  const refreshData = useCallback(() => {
    loadData(true);
  }, [loadData]);

  const clearData = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastUpdated: null
    });
    clearCache('lazy_dashboard');
    adminService.clearAdminDashboardCache();
  }, [clearCache]);

  // Get specific data without triggering a load
  const getBranches = useCallback(() => state.data?.branches || [], [state.data]);
  const getAccounts = useCallback(() => state.data?.accounts || [], [state.data]);
  const getTransactions = useCallback(() => state.data?.transactions || [], [state.data]);
  const getAnalytics = useCallback(() => state.data?.analytics || null, [state.data]);

  // Check if data is stale (older than 5 minutes)
  const isStale = useCallback(() => {
    if (!state.lastUpdated) return true;
    return Date.now() - state.lastUpdated > 5 * 60 * 1000;
  }, [state.lastUpdated]);

  // Load data only if not already loaded or if stale
  const ensureData = useCallback(async () => {
    if (!state.data || isStale()) {
      await loadData();
    }
  }, [state.data, isStale, loadData]);

  return {
    ...state,
    loadData,
    refreshData,
    clearData,
    ensureData,
    getBranches,
    getAccounts,
    getTransactions,
    getAnalytics,
    isStale: isStale()
  };
};
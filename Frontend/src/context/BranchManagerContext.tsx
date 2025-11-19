import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { branchManagerService, BranchManagerWorkspaceData } from '@/services/branchManagerService';
import { useNotification } from './NotificationContext';
import { showGlobalError } from '@/utils/globalErrorHandler';
import { authService } from '@/services/authService';

interface BranchManagerContextType {
  data: BranchManagerWorkspaceData | null;
  loading: boolean;
  error: string | null;
  loadData: (force?: boolean) => Promise<void>;
  clearData: () => void;
  refreshData: () => Promise<void>;
  triggerLoad: () => void;
}

export const BranchManagerContext = createContext<BranchManagerContextType | undefined>(undefined);

// User-specific cache to prevent data sharing between different branch managers
let userCaches: Map<number, {
  data: BranchManagerWorkspaceData | null;
  lastFetch: number;
  initialLoadDone: boolean;
}> = new Map();

function getUserCache(userId: number) {
  if (!userCaches.has(userId)) {
    userCaches.set(userId, {
      data: null,
      lastFetch: 0,
      initialLoadDone: false
    });
  }
  return userCaches.get(userId)!;
}

export const BranchManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentUser = authService.getCurrentUser();
  const userCache = currentUser ? getUserCache(currentUser.id) : null;
  
  const [data, setData] = useState<BranchManagerWorkspaceData | null>(userCache?.data || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef<boolean>(false);
  const { showNotification } = useNotification();

  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes


  
  const loadDataInternal = async (force = false) => {
    if (!userCache) return;
    
    const now = Date.now();
    
    // Skip if data is fresh and not forced
    if (!force && userCache.data && (now - userCache.lastFetch) < CACHE_DURATION) {
      return;
    }

    // Prevent multiple simultaneous calls
    if (loadingRef.current) {
      return;
    }

    // Debounce rapid successive calls (prevent within 1 second)
    if (!force && (now - userCache.lastFetch) < 1000) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      
      const workspaceData = await branchManagerService.getBranchManagerWorkspace();
      
      // Update user-specific cache
      userCache.data = workspaceData;
      userCache.lastFetch = now;
      userCache.initialLoadDone = true;
      
      setData(workspaceData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load branch manager data';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const loadData = useCallback(loadDataInternal, [showNotification]);

  const clearData = useCallback(() => {
    if (userCache) {
      userCache.data = null;
      userCache.lastFetch = 0;
      userCache.initialLoadDone = false;
    }
    setData(null);
    setError(null);
  }, [userCache]);

  const refreshData = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  const triggerLoad = useCallback(() => {
    if (!userCache) return;
    
    // Only load if we haven't loaded before and not currently loading
    if (!userCache.initialLoadDone && !userCache.data && !loadingRef.current) {
      loadDataInternal();
    } else if (userCache.data) {
      // Ensure local state is synced with user cache
      if (!data) {
        setData(userCache.data);
      }
    }
  }, [data, userCache]);

  const value: BranchManagerContextType = {
    data,
    loading,
    error,
    loadData,
    clearData,
    refreshData,
    triggerLoad
  };

  return (
    <BranchManagerContext.Provider value={value}>
      {children}
    </BranchManagerContext.Provider>
  );
};

export const useBranchManager = (): BranchManagerContextType => {
  const context = useContext(BranchManagerContext);
  if (context === undefined) {
    throw new Error('useBranchManager must be used within a BranchManagerProvider');
  }
  return context;
};
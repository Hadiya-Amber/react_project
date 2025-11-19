import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { analyticsService, CustomerCompleteDashboardData } from '@/services/analyticsService';
import { useAuth } from '@/context/AuthContext';
import { showGlobalError } from '@/utils/globalErrorHandler';

interface CustomerContextType {
  data: CustomerCompleteDashboardData | null;
  loading: boolean;
  error: string | null;
  refreshData: (force?: boolean) => Promise<void>;
  invalidateCache: () => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

interface CustomerProviderProps {
  children: ReactNode;
}

// User-specific cache to persist across component remounts
let userCacheMap: Map<string, {
  data: CustomerCompleteDashboardData | null;
  lastFetch: number;
}> = new Map();

export const CustomerProvider: React.FC<CustomerProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id?.toString() || 'anonymous';
  
  // Get user-specific cache
  const getUserCache = () => {
    if (!userCacheMap.has(userId)) {
      userCacheMap.set(userId, { data: null, lastFetch: 0 });
    }
    return userCacheMap.get(userId)!;
  };
  
  const userCache = getUserCache();
  const [data, setData] = useState<CustomerCompleteDashboardData | null>(userCache.data);
  const [loading, setLoading] = useState(!userCache.data);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(userCache.lastFetch);

  const refreshData = async (force = false) => {
    // Delegate to analytics service cache - no direct API calls
    if (force) {
      window.location.reload();
    }
  };

  useEffect(() => {
    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }
    
    // Check if we have cached data for this user
    const cache = getUserCache();
    if (cache.data) {
      setData(cache.data);
      setLoading(false);
    } else {
      // Trigger API call through analytics service
      setLoading(true);
      analyticsService.getCustomerCompleteDashboardData()
        .then(data => {
          updateData(data);
        })
        .catch(err => {
          if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
            setError('Failed to load dashboard data');
          }
          setLoading(false);
        });
    }
  }, [user?.id]);

  const invalidateCache = () => {
    const cache = getUserCache();
    cache.data = null;
    cache.lastFetch = 0;
    setData(null);
    setLastFetch(0);
    setLoading(true);
  };

  // Method to update data from external source (analytics service)
  const updateData = (newData: CustomerCompleteDashboardData) => {
    setData(newData);
    setLoading(false);
    setError(null);
    const cache = getUserCache();
    cache.data = newData;
    cache.lastFetch = Date.now();
  };

  const value: CustomerContextType = {
    data,
    loading,
    error,
    refreshData,
    invalidateCache,
  };

  // Expose updateData method globally for analytics service to use
  React.useEffect(() => {
    if (user) {
      (window as any).__customerContextUpdate = updateData;
    }
    return () => {
      delete (window as any).__customerContextUpdate;
    };
  }, [user]);

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = (): CustomerContextType => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};
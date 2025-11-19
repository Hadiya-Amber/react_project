import { use, useMemo } from 'react';
import { adminService } from '@/services/adminService';
import { analyticsService } from '@/services/analyticsService';
import { accountService } from '@/services/accountService';
import { transactionService } from '@/services/transactionService';

// BankEase React 19 use() hook implementations for banking data promises
export const useAdminDashboardData = (force = false) => {
  const promise = useMemo(() => 
    adminService.getCompleteAdminDashboard(force), 
    [force]
  );
  return use(promise);
};

// Global promise cache to prevent duplicate calls across all hook instances
const promiseCache = new Map<string, Promise<any>>();

export const useCustomerDashboardData = () => {
  const promise = useMemo(() => {
    const cacheKey = 'customer-dashboard';
    
    // Return existing promise if already cached
    if (promiseCache.has(cacheKey)) {
      return promiseCache.get(cacheKey)!;
    }
    
    // Create new promise and cache it
    const newPromise = analyticsService.getCustomerCompleteDashboardData()
      .finally(() => {
        // Clear from cache after completion
        setTimeout(() => {
          promiseCache.delete(cacheKey);
        }, 500);
      });
    
    promiseCache.set(cacheKey, newPromise);
    return newPromise;
  }, []);
  
  return use(promise);
};

export const useAccountsData = () => {
  const promise = useMemo(() => 
    accountService.getMyAccounts(), 
    []
  );
  return use(promise);
};

export const useTransactionsData = () => {
  const promise = useMemo(() => 
    transactionService.getAllTransactions(), 
    []
  );
  return use(promise);
};

// BankEase React 19 use() hook for conditional banking data promises
export const useConditionalData = <T>(
  condition: boolean, 
  promiseFactory: () => Promise<T>
): T | null => {
  const promise = useMemo(() => 
    condition ? promiseFactory() : Promise.resolve(null), 
    [condition, promiseFactory]
  );
  return use(promise);
};

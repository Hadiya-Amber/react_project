import { useCallback, useRef } from 'react';
import { apiOptimizer } from '@/utils/apiOptimizer';

// Hook to ensure only one API call per action
export const useSingleRequest = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const singleRequest = useCallback(async <T>(
    key: string,
    requestFn: (signal?: AbortSignal) => Promise<T>,
    options: {
      cache?: boolean;
      cacheTTL?: number;
      dedupe?: boolean;
    } = {}
  ): Promise<T> => {
    const { cache = true, cacheTTL = 5, dedupe = true } = options;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const wrappedRequestFn = () => requestFn(signal);

    try {
      if (cache) {
        return await apiOptimizer.cached(key, wrappedRequestFn, cacheTTL);
      } else if (dedupe) {
        return await apiOptimizer.dedupe(key, wrappedRequestFn);
      } else {
        return await wrappedRequestFn();
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request cancelled');
      }
      throw error;
    }
  }, []);

  const clearCache = useCallback((pattern?: string) => {
    apiOptimizer.clearCache(pattern);
  }, []);

  const cancelRequests = useCallback((pattern?: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    apiOptimizer.cancelPending(pattern);
  }, []);

  return {
    singleRequest,
    clearCache,
    cancelRequests
  };
};
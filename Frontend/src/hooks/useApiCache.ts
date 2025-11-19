import { useRef, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function useApiCache<T>(cacheTimeMs: number = 30000) {
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());
  const pendingRequests = useRef<Map<string, Promise<T>>>(new Map());

  const getCachedData = useCallback((key: string): T | null => {
    const entry = cache.current.get(key);
    if (entry && Date.now() - entry.timestamp < cacheTimeMs) {
      return entry.data;
    }
    return null;
  }, [cacheTimeMs]);

  const setCachedData = useCallback((key: string, data: T) => {
    cache.current.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);

  const fetchWithCache = useCallback(async (
    key: string,
    fetchFn: () => Promise<T>,
    force: boolean = false
  ): Promise<T> => {
    // Check cache first
    if (!force) {
      const cachedData = getCachedData(key);
      if (cachedData) {
        return cachedData;
      }
    }

    // Check if request is already pending
    const pendingRequest = pendingRequests.current.get(key);
    if (pendingRequest) {
      return pendingRequest;
    }

    // Make new request
    const request = fetchFn().then(data => {
      setCachedData(key, data);
      pendingRequests.current.delete(key);
      return data;
    }).catch(error => {
      pendingRequests.current.delete(key);
      throw error;
    });

    pendingRequests.current.set(key, request);
    return request;
  }, [getCachedData, setCachedData]);

  const clearCache = useCallback((key?: string) => {
    if (key) {
      cache.current.delete(key);
      pendingRequests.current.delete(key);
    } else {
      cache.current.clear();
      pendingRequests.current.clear();
    }
  }, []);

  return {
    fetchWithCache,
    clearCache,
    getCachedData
  };
}

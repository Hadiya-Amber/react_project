import { useState, useCallback, useRef, useEffect } from 'react';
import api from '@/api/axios';

interface UseApiCallOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  showNotification?: boolean;
}

interface UseApiCallReturn {
  isLoading: boolean;
  error: string | null;
  execute: (endpoint: string, options?: any) => Promise<any>;
  reset: () => void;
}

export const useApiCall = (options: UseApiCallOptions = {}): UseApiCallReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { onSuccess, onError, showNotification = true } = options;

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const execute = useCallback(async (endpoint: string, options: any = {}) => {
    // Prevent duplicate requests
    if (isLoading) {
      // API call already in progress
      return null;
    }

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setError(null);

    try {
      const { method = 'GET', data, params, ...restOptions } = options;
      
      const response = await api({
        url: endpoint,
        method,
        data,
        params,
        signal: abortControllerRef.current.signal,
        ...restOptions
      });

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (err: any) {
      if (err.name === 'AbortError') {

        return null;
      }

      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);

      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isLoading, onSuccess, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return {
    isLoading,
    error,
    execute,
    reset
  };
};

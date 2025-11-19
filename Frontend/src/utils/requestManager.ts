// Global Request Manager - Prevents multiple identical API calls
class RequestManager {
  private static instance: RequestManager;
  private pendingRequests = new Map<string, Promise<any>>();
  private requestCounts = new Map<string, number>();
  private lastRequestTime = new Map<string, number>();
  
  // Minimum time between identical requests (in ms)
  private readonly MIN_REQUEST_INTERVAL = 1000; // 1 second
  
  static getInstance(): RequestManager {
    if (!RequestManager.instance) {
      RequestManager.instance = new RequestManager();
    }
    return RequestManager.instance;
  }

  // Execute request with deduplication and throttling
  async executeRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    options: {
      throttle?: boolean;
      dedupe?: boolean;
      maxRetries?: number;
    } = {}
  ): Promise<T> {
    const { throttle = true, dedupe = true, maxRetries = 0 } = options;
    
    // Throttling: prevent too frequent requests
    if (throttle) {
      const lastTime = this.lastRequestTime.get(key) || 0;
      const now = Date.now();
      if (now - lastTime < this.MIN_REQUEST_INTERVAL) {
        throw new Error('Request throttled - too frequent');
      }
    }

    // Deduplication: return existing promise if request is pending
    if (dedupe && this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Track request count
    const count = this.requestCounts.get(key) || 0;
    this.requestCounts.set(key, count + 1);
    this.lastRequestTime.set(key, Date.now());

    // Create and execute request
    const promise = this.executeWithRetry(requestFn, maxRetries)
      .finally(() => {
        this.pendingRequests.delete(key);
      });

    if (dedupe) {
      this.pendingRequests.set(key, promise);
    }

    return promise;
  }

  private async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    maxRetries: number
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw error;
        }
        
        // Wait before retry
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    
    throw lastError!;
  }

  // Cancel all pending requests
  cancelAllRequests(): void {
    this.pendingRequests.clear();
  }

  // Cancel specific request
  cancelRequest(key: string): void {
    this.pendingRequests.delete(key);
  }

  // Get request statistics
  getStats(): { [key: string]: number } {
    return Object.fromEntries(this.requestCounts);
  }

  // Reset statistics
  resetStats(): void {
    this.requestCounts.clear();
    this.lastRequestTime.clear();
  }

  // Check if request is pending
  isPending(key: string): boolean {
    return this.pendingRequests.has(key);
  }
}

export const requestManager = RequestManager.getInstance();

// Helper function for common use cases
export const optimizedRequest = <T>(
  key: string,
  requestFn: () => Promise<T>,
  options?: {
    throttle?: boolean;
    dedupe?: boolean;
    maxRetries?: number;
  }
): Promise<T> => {
  return requestManager.executeRequest(key, requestFn, options);
};
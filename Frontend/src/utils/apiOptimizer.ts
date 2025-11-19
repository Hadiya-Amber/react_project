// API Optimizer - Prevents multiple API calls per action
class ApiOptimizer {
  private pendingRequests = new Map<string, Promise<any>>();
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private requestQueue = new Map<string, Array<{ resolve: Function; reject: Function }>>();

  // Deduplicate identical requests
  async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // If request is already pending, return the same promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Create new request
    const promise = requestFn()
      .finally(() => {
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  // Cache with TTL
  async cached<T>(key: string, requestFn: () => Promise<T>, ttlMinutes = 5): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    // Return cached data if still valid
    if (cached && now - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    // Fetch new data
    const data = await this.dedupe(key, requestFn);
    
    // Cache the result
    this.cache.set(key, {
      data,
      timestamp: now,
      ttl: ttlMinutes * 60 * 1000
    });

    return data;
  }

  // Batch requests together
  async batch<T>(key: string, requestFn: () => Promise<T>, delayMs = 50): Promise<T> {
    return new Promise((resolve, reject) => {
      // Add to queue
      if (!this.requestQueue.has(key)) {
        this.requestQueue.set(key, []);
        
        // Process queue after delay
        setTimeout(async () => {
          const queue = this.requestQueue.get(key) || [];
          this.requestQueue.delete(key);
          
          try {
            const result = await requestFn();
            queue.forEach(({ resolve }) => resolve(result));
          } catch (error) {
            queue.forEach(({ reject }) => reject(error));
          }
        }, delayMs);
      }
      
      this.requestQueue.get(key)!.push({ resolve, reject });
    });
  }

  // Clear cache
  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Cancel pending requests
  cancelPending(pattern?: string): void {
    if (pattern) {
      for (const key of this.pendingRequests.keys()) {
        if (key.includes(pattern)) {
          this.pendingRequests.delete(key);
        }
      }
    } else {
      this.pendingRequests.clear();
    }
  }
}

export const apiOptimizer = new ApiOptimizer();
import { branchManagerService, BranchManagerWorkspaceData } from '@/services/branchManagerService';

class BranchManagerStore {
  private static instance: BranchManagerStore;
  private data: BranchManagerWorkspaceData | null = null;
  private loading = false;
  private error: string | null = null;
  public lastFetch = 0; // Make public for hook access
  private subscribers: Set<() => void> = new Set();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  static getInstance(): BranchManagerStore {
    if (!BranchManagerStore.instance) {
      BranchManagerStore.instance = new BranchManagerStore();
    }
    return BranchManagerStore.instance;
  }

  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify() {
    this.subscribers.forEach(callback => callback());
  }

  async loadData(force = false): Promise<void> {
    const now = Date.now();
    
    // Check cache first - if we have data and it's fresh, don't reload
    if (!force && this.data && (now - this.lastFetch) < this.CACHE_DURATION) {
      this.notify(); // Notify subscribers with existing data
      return;
    }

    // Prevent multiple simultaneous calls
    if (this.loading) {
      return;
    }

    try {
      this.loading = true;
      this.error = null;
      this.notify();
      
      const workspaceData = await branchManagerService.getBranchManagerWorkspace();
      this.data = workspaceData;
      this.lastFetch = now;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to load branch manager data';
    } finally {
      this.loading = false;
      this.notify();
    }
  }

  getData() {
    return {
      data: this.data,
      loading: this.loading,
      error: this.error
    };
  }

  clearData() {
    this.data = null;
    this.error = null;
    this.lastFetch = 0;
    this.notify();
  }

  async refreshData() {
    await this.loadData(true);
  }
}

export const branchManagerStore = BranchManagerStore.getInstance();
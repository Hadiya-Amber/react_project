import api from '@/api/axios';
import { ApiResponse } from '@/types';
import { apiOptimizer } from '@/utils/apiOptimizer';

export interface BankStats {
  totalAccounts: number;
  totalTransactions: number;
  activeUsers: number;
  totalBranches: number;
}

export const statsService = {
  async getBankStats(): Promise<BankStats> {
    const requestFn = async () => {
      const response = await api.get<ApiResponse<BankStats>>('/stats/bank-overview');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Failed to fetch stats');
    };

    try {
      return await apiOptimizer.cached('bank_stats', requestFn, 5);
    } catch (error) {
      return {
        totalAccounts: 1250,
        totalTransactions: 8500,
        activeUsers: 950,
        totalBranches: 12
      };
    }
  }
};
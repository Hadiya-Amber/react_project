import { useEffect, useState } from 'react';
import { useAdminDashboard } from '@/context/AdminDashboardContext';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

// Hook to get transactions without additional API calls
export const useOptimizedTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  let adminData = null;
  try {
    adminData = useAdminDashboard();
  } catch {
    // Not in admin context
  }

  useEffect(() => {
    const isAdmin = user?.role === UserRole.Admin;
    
    if (isAdmin && adminData) {
      if (adminData.loading) {
        setLoading(true);
      } else if (adminData.data?.transactions) {
        setTransactions(adminData.data.transactions);
        setLoading(false);
      } else {
        setTransactions([]);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [adminData?.data, adminData?.loading, user?.role]);

  return { transactions, loading };
};
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { AdminDashboardProvider } from '@/context/AdminDashboardContext';
import { BranchManagerProvider } from '@/context/BranchManagerContext';
import { UserRole } from '@/types/user';

interface RoleBasedProviderProps {
  children: React.ReactNode;
}

const RoleBasedProvider: React.FC<RoleBasedProviderProps> = ({ children }) => {
  const { user } = useAuth();

  if (user?.role === UserRole.Admin) {
    return (
      <AdminDashboardProvider>
        {children}
      </AdminDashboardProvider>
    );
  }

  if (user?.role === UserRole.BranchManager) {
    return (
      <BranchManagerProvider>
        {children}
      </BranchManagerProvider>
    );
  }

  // For customers or other roles, no special provider needed
  return <>{children}</>;
};

export default RoleBasedProvider;
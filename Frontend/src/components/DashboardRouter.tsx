import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { AdminDashboardProvider } from '@/context/AdminDashboardContext';
import { BranchManagerProvider } from '@/context/BranchManagerContext';
import { CustomerProvider } from '@/context/CustomerContext';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import BranchManagerDashboard from '@/pages/branch-manager/BranchManagerDashboard';
import CustomerDashboard from '@/pages/customer/CustomerDashboard';
import { Box, Typography, CircularProgress } from '@mui/material';
import { UserRole } from '@/types';

const DashboardRouter: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="text.secondary">
          Please log in to access your dashboard
        </Typography>
      </Box>
    );
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case UserRole.Admin:
      return (
        <AdminDashboardProvider>
          <AdminDashboardPage />
        </AdminDashboardProvider>
      );
    case UserRole.BranchManager:
      return (
        <BranchManagerProvider>
          <BranchManagerDashboard />
        </BranchManagerProvider>
      );
    case UserRole.Customer:
      return (
        <CustomerProvider>
          <CustomerDashboard />
        </CustomerProvider>
      );
    default:
      return (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="error">
            Unknown user role: {user.role}
          </Typography>
        </Box>
      );
  }
};

export default DashboardRouter;

import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import BranchManagerDashboard from '@/pages/branch-manager/BranchManagerDashboard';
import DashboardPage from '@/pages/dashboard/DashboardPage';

const RoleBasedDashboard: React.FC = () => {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'Admin':
      return <AdminDashboardPage />;
    case 'BranchManager':
      return <BranchManagerDashboard />;
    case 'Customer':
      return <DashboardPage />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default RoleBasedDashboard;

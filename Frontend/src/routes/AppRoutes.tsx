import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserRole } from '@/types/user';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';
import { AdminDashboardProvider } from '@/context/AdminDashboardContext';
import { BranchManagerProvider } from '@/context/BranchManagerContext';
import { CustomerProvider } from '@/context/CustomerContext';
import RoleBasedProvider from '@/components/RoleBasedProvider';
import { useAuth } from '@/context/AuthContext';

import LoginPage from '@/pages/auth/CleanLoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import OtpVerificationPage from '@/pages/auth/OtpVerificationPage';
import CompleteRegistrationPage from '@/pages/auth/CompleteRegistrationPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import DashboardRouter from '@/components/DashboardRouter';
import AccountsPage from '@/pages/accounts/AccountsPage';
import CreateAccountPage from '@/pages/accounts/CreateAccountPage';
import PendingAccountsPage from '@/pages/accounts/PendingAccountsPage';
import TransactionsPage from '@/pages/transactions/TransactionsPage';
import DepositPage from '@/pages/transactions/DepositPage';
import WithdrawPage from '@/pages/transactions/WithdrawPage';
import TransferPage from '@/pages/transactions/TransferPage';
import PendingTransactionsPage from '@/pages/transactions/PendingTransactionsPage';
import CreateBranchManagerPage from '@/pages/admin/CreateBranchManagerPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import BranchesPage from '@/pages/admin/BranchesPage';
import BranchDetailsPage from '@/pages/admin/BranchDetailsPage';
import ProfilePage from '@/pages/ProfilePage';
import CustomerProfilePage from '@/pages/customer/ProfilePage';
import AnalyticsPage from '@/pages/customer/AnalyticsPage';
import HomePage from '@/pages/HomePage';
import ChangePasswordPage from '@/pages/branch-manager/ChangePasswordPage';
import BranchManagerDashboard from '@/pages/branch-manager/BranchManagerDashboard';
import BranchManagerPendingTransactionsPage from '@/pages/branch-manager/PendingTransactionsPage';
import BranchManagerReportsPage from '@/pages/branch-manager/ReportsPage';
import OptimizedPendingAccountsPage from '@/pages/branch-manager/OptimizedPendingAccountsPage';
import OptimizedPendingTransactionsPage from '@/pages/branch-manager/OptimizedPendingTransactionsPage';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  
  // Wrap routes with appropriate providers based on user role
  const ProviderWrapper = ({ children }: { children: React.ReactNode }) => {
    // For customers, wrap with both providers
    if (user?.role === UserRole.Customer) {
      return (
        <BranchManagerProvider>
          <CustomerProvider>
            {children}
          </CustomerProvider>
        </BranchManagerProvider>
      );
    }
    
    // For branch managers, only BranchManagerProvider
    if (user?.role === UserRole.BranchManager) {
      return (
        <BranchManagerProvider>
          {children}
        </BranchManagerProvider>
      );
    }
    
    // For admins and others, no context providers (they have their own)
    return <>{children}</>;
  };
  
  return (
    <ProviderWrapper>
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/register" element={<RegisterPage />} />
      
      <Route path="/register/verify" element={<OtpVerificationPage />} />
      
      <Route path="/register/complete" element={<CompleteRegistrationPage />} />
      
      <Route path="/forgot-password" element={
        <AuthLayout>
          <ForgotPasswordPage />
        </AuthLayout>
      } />
      
      <Route path="/reset-password/verify" element={
        <AuthLayout>
          <ResetPasswordPage />
        </AuthLayout>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            <DashboardRouter />
          </DashboardLayout>
        </ProtectedRoute>
      } />

        <Route path="/branch-manager/*" element={
          <ProtectedRoute allowedRoles={[UserRole.BranchManager]}>
            <BranchManagerProvider>
              <DashboardLayout>
                <Routes>
                  <Route path="dashboard" element={<BranchManagerDashboard />} />
                  <Route path="pending-accounts" element={<OptimizedPendingAccountsPage />} />
                  <Route path="pending-transactions" element={<OptimizedPendingTransactionsPage />} />
                  <Route path="reports" element={<BranchManagerReportsPage />} />
                </Routes>
              </DashboardLayout>
            </BranchManagerProvider>
          </ProtectedRoute>
        } />

      <Route path="/accounts" element={
        <ProtectedRoute>
          <DashboardLayout>
            <RoleBasedProvider>
              <AccountsPage />
            </RoleBasedProvider>
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/accounts/create" element={
        <ProtectedRoute allowedRoles={[UserRole.Customer]}>
          <CustomerProvider>
            <DashboardLayout>
              <CreateAccountPage />
            </DashboardLayout>
          </CustomerProvider>
        </ProtectedRoute>
      } />

        <Route path="/accounts/pending" element={
          <ProtectedRoute allowedRoles={[UserRole.BranchManager, UserRole.Admin]}>
            <DashboardLayout>
              <PendingAccountsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />

      <Route path="/transactions" element={
        <ProtectedRoute>
          <DashboardLayout>
            <RoleBasedProvider>
              <TransactionsPage />
            </RoleBasedProvider>
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/transactions/deposit" element={
        <ProtectedRoute allowedRoles={[UserRole.Customer, UserRole.BranchManager, UserRole.Admin]}>
          <CustomerProvider>
            <RoleBasedProvider>
              <DashboardLayout>
                <DepositPage />
              </DashboardLayout>
            </RoleBasedProvider>
          </CustomerProvider>
        </ProtectedRoute>
      } />

      <Route path="/transactions/withdraw" element={
        <ProtectedRoute allowedRoles={[UserRole.Customer]}>
          <CustomerProvider>
            <DashboardLayout>
              <WithdrawPage />
            </DashboardLayout>
          </CustomerProvider>
        </ProtectedRoute>
      } />

      <Route path="/transactions/transfer" element={
        <ProtectedRoute allowedRoles={[UserRole.Customer]}>
          <CustomerProvider>
            <DashboardLayout>
              <TransferPage />
            </DashboardLayout>
          </CustomerProvider>
        </ProtectedRoute>
      } />

        <Route path="/transactions/pending" element={
          <ProtectedRoute allowedRoles={[UserRole.BranchManager, UserRole.Admin]}>
            <DashboardLayout>
              <PendingTransactionsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />

      {/* Admin Routes */}
      <Route path="/admin/branches" element={
        <ProtectedRoute allowedRoles={[UserRole.Admin]}>
          <AdminDashboardProvider>
            <DashboardLayout>
              <BranchesPage />
            </DashboardLayout>
          </AdminDashboardProvider>
        </ProtectedRoute>
      } />

      <Route path="/admin/create-branch-manager" element={
        <ProtectedRoute allowedRoles={[UserRole.Admin]}>
          <AdminDashboardProvider>
            <DashboardLayout>
              <CreateBranchManagerPage />
            </DashboardLayout>
          </AdminDashboardProvider>
        </ProtectedRoute>
      } />

      <Route path="/admin/branches/:id" element={
        <ProtectedRoute allowedRoles={[UserRole.Admin]}>
          <AdminDashboardProvider>
            <DashboardLayout>
              <BranchDetailsPage />
            </DashboardLayout>
          </AdminDashboardProvider>
        </ProtectedRoute>
      } />

      {/* Profile Route */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ProfilePage />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Change Password Route */}
      <Route path="/change-password" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ChangePasswordPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Customer Routes */}
      <Route path="/customer/profile" element={
        <ProtectedRoute allowedRoles={[UserRole.Customer]}>
          <DashboardLayout>
            <CustomerProfilePage />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/customer/analytics" element={
        <ProtectedRoute allowedRoles={[UserRole.Customer]}>
          <DashboardLayout>
            <AnalyticsPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />

        {/* Default Routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ProviderWrapper>
  );
};

export default AppRoutes;

import React, { ComponentType } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { UserRole } from '@/types/user';

export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  requiredRole?: UserRole
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
      return <Navigate to="/dashboard" replace />;
    }

    return <WrappedComponent {...props} />;
  };
}

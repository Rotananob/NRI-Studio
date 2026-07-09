import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isGuest, isLoading } = useAuthStore();

  if (isLoading) return null;
  if (!isAuthenticated && !isGuest) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;

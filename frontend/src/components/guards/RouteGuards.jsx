import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ProtectedRoute = ({ children, requireRole }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireRole && user?.role !== requireRole) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/member'} replace />;
  }
  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) return <Navigate to={user?.role === 'admin' ? '/admin' : '/member'} replace />;
  return children;
};

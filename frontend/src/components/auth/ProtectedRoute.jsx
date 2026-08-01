import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

function ProtectedRoute({ requiredRole, children }) {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  const allowedRoles = requiredRole
    ? Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole]
    : [];
  const isRoleMismatch =
    isAuthenticated &&
    requiredRole &&
    !allowedRoles.includes(user?.role);

  useEffect(() => {
    if (isRoleMismatch) {
      toast.error("You don't have access to that page.");
    }
  }, [isRoleMismatch]);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <LoadingSpinner size="md" label="Checking your session…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isRoleMismatch) {
    return <Navigate to="/" replace />;
  }

  return children ?? <Outlet />;
}

export default ProtectedRoute;
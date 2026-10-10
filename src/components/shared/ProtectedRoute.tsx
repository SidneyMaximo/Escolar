import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_DASHBOARDS } from '@/types/roles';
import type { AppRole } from '@/types/database';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  allowedRoles: AppRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { session, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/entrar" replace />;
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    const fallback = ROLE_DASHBOARDS[profile?.role ?? 'parent'];
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
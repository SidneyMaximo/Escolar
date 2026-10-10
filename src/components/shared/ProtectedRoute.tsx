import { Navigate, Outlet } from 'react-router-dom';
import { Clock, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_DASHBOARDS } from '@/types/roles';
import type { AppRole } from '@/types/database';
import { supabase } from '@/lib/supabase';
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

  const effectiveRole = profile?.role || (session.user.user_metadata?.role as AppRole) || 'parent';

  // Se o usuário não for Admin e o cadastro ainda estiver pendente de liberação
  if (effectiveRole !== 'admin' && profile?.status === 'pending') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md w-full rounded-2xl border border-amber-500/30 bg-card p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/30">
            <Clock className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Aguardando Liberação do Acesso</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Olá, <strong>{profile?.full_name || 'Usuário'}</strong>! Sua conta foi criada e está aguardando aprovação da administração escolar para liberação do acesso.
          </p>
          <div className="mt-6 border-t border-border pt-4">
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Se o usuário estiver bloqueado
  if (effectiveRole !== 'admin' && profile?.status === 'blocked') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md w-full rounded-2xl border border-destructive/30 bg-card p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/15 text-destructive border border-destructive/30">
            <XCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Acesso Suspenso</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Seu acesso foi temporariamente suspenso pela administração da instituição. Por favor, entre em contato com a secretaria da escola.
          </p>
          <div className="mt-6 border-t border-border pt-4">
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(effectiveRole)) {
    const fallback = ROLE_DASHBOARDS[effectiveRole] || '/';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
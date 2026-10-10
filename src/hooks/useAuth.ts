import { useEffect, useState } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, AppRole } from '@/types/database';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    profile: null,
    isLoading: true,
  });

  useEffect(() => {
    let mounted = true;

    async function fetchProfile(session: Session | null): Promise<Profile | null> {
      if (!session) return null;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) return profile;
      } catch (err) {
        console.warn('Erro ao carregar perfil do Supabase:', err);
      }

      // Fallback seguro usando os metadados do auth.users (ex: criado via script SQL ou admin)
      const metaRole = (session.user.user_metadata?.role as AppRole) || 'parent';
      return {
        id: session.user.id,
        school_id: session.user.user_metadata?.school_id || '00000000-0000-0000-0000-000000000001',
        full_name: session.user.user_metadata?.full_name || session.user.email || 'Usuário',
        role: metaRole,
        status: (metaRole === 'admin' ? 'approved' : session.user.user_metadata?.status || 'approved'),
        cpf: null,
        phone: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Profile;
    }

    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session) {
          const profile = await fetchProfile(session);
          if (mounted) setState({ session, profile, isLoading: false });
        } else {
          if (mounted) setState({ session: null, profile: null, isLoading: false });
        }
      } catch (err) {
        console.warn('Erro ao buscar sessão inicial:', err);
        if (mounted) setState({ session: null, profile: null, isLoading: false });
      }
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;

        if (session) {
          const profile = await fetchProfile(session);
          if (mounted) setState({ session, profile, isLoading: false });
        } else {
          if (mounted) setState({ session: null, profile: null, isLoading: false });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
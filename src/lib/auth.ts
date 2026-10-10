import { supabase } from './supabase';
import type { AppRole } from '@/types/database';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string, fullName: string, role: AppRole, schoolId: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role, school_id: schoolId, status: 'pending' },
    },
  });
  if (error) throw error;

  if (data?.user) {
    try {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        school_id: schoolId,
        full_name: fullName,
        email,
        role,
        status: 'pending',
      });
    } catch (e) {
      // Ignora se o trigger do banco já tiver criado
    }

    // Adiciona localmente para a demonstração
    try {
      const localRaw = localStorage.getItem('escola_saas_all_users');
      const list = localRaw ? JSON.parse(localRaw) : [];
      list.unshift({
        id: data.user.id,
        school_id: schoolId,
        full_name: fullName,
        email,
        phone: null,
        cpf: null,
        avatar_url: null,
        role,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      localStorage.setItem('escola_saas_all_users', JSON.stringify(list));
    } catch (e) {
      console.warn('Erro ao salvar usuário localmente:', e);
    }
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return data;
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}
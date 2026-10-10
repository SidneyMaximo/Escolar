import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '@/lib/auth';
import { ROLE_DASHBOARDS } from '@/types/roles';
import { supabase } from '@/lib/supabase';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await signIn(email, password);
      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        const dashboard = ROLE_DASHBOARDS[profile?.role ?? 'parent'];
        navigate(dashboard, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Entrar</h2>
      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground">E-mail</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
          placeholder="seu@email.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground">Senha</label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
      <div className="flex items-center justify-between text-sm">
        <Link to="/recuperar-senha" className="text-muted-foreground hover:text-primary">
          Esqueceu a senha?
        </Link>
        <Link to="/cadastrar" className="font-medium text-primary hover:underline">
          Criar conta
        </Link>
      </div>
    </form>
  );
}
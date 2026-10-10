import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '@/lib/auth';
import type { AppRole } from '@/types/database';

export function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AppRole>('parent');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // TODO: school_id should come from selection or default
      await signUp(email, password, fullName, role, '00000000-0000-0000-0000-000000000001');
      navigate('/entrar');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Criar Conta</h2>
      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-foreground">Nome completo</label>
        <input
          id="fullName"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
          placeholder="Seu nome"
        />
      </div>
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
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
          placeholder="Mínimo 6 caracteres"
        />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-foreground">Tipo de conta</label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as AppRole)}
          className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
        >
          <option value="parent">Responsável / Pai / Mãe</option>
          <option value="teacher">Professor</option>
        </select>
        <p className="mt-1 text-xs text-muted-foreground">
          Contas de administrador são criadas apenas pela coordenação.
        </p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? 'Criando conta...' : 'Criar Conta'}
      </button>
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Já tem conta? </span>
        <Link to="/entrar" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </div>
    </form>
  );
}
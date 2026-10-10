import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { signUp } from '@/lib/auth';

export function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Role fixa como 'parent' com status 'pending' para aprovação do admin
      await signUp(email, password, fullName, 'parent', '00000000-0000-0000-0000-000000000001');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/30">
          <Clock className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Conta Criada!</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Seu cadastro foi realizado com sucesso. Para garantir a segurança dos alunos, o seu acesso está <strong>aguardando liberação do Administrador</strong> da escola.
        </p>
        <div className="pt-2">
          <Link
            to="/entrar"
            className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Ir para a Tela de Login
          </Link>
        </div>
      </div>
    );
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
      <p className="text-xs text-muted-foreground">
        Cadastro exclusivo para pais/responsáveis. Professores e administradores são criados pela coordenação.
      </p>
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
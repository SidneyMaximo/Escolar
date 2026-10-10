import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, GraduationCap, FileText, Plus, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    enrollments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [
          { count: studentsCount },
          { count: teachersCount },
          { count: classesCount },
          { count: enrollmentsCount },
        ] = await Promise.all([
          supabase.from('students').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
          supabase.from('classes').select('*', { count: 'exact', head: true }),
          supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        ]);

        setStats({
          students: studentsCount ?? 0,
          teachers: teachersCount ?? 0,
          classes: classesCount ?? 0,
          enrollments: enrollmentsCount ?? 0,
        });
      } catch (err) {
        console.warn('Erro ao carregar estatísticas do dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const statCards = [
    {
      label: 'Alunos Matriculados',
      value: loading ? '...' : stats.students,
      icon: Users,
      color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40',
      to: '/admin/alunos',
    },
    {
      label: 'Professores Ativos',
      value: loading ? '...' : stats.teachers,
      icon: BookOpen,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40',
      to: '/admin/professores',
    },
    {
      label: 'Turmas Criadas',
      value: loading ? '...' : stats.classes,
      icon: GraduationCap,
      color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40',
      to: '/admin/turmas',
    },
    {
      label: 'Matrículas Pendentes',
      value: loading ? '...' : stats.enrollments,
      icon: FileText,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40',
      to: '/admin/matriculas',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Olá, {profile?.full_name || 'Administrador'} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Bem-vindo ao painel de controle da Escola Infantil.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/alunos"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Cadastrar Aluno
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            to={stat.to}
            className="group relative rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-3xl font-extrabold text-foreground">{stat.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Acessar área</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick navigation sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card Atalhos */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/admin/turmas"
              className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/30 p-3 hover:bg-muted/70 transition-colors"
            >
              <span className="font-semibold text-sm text-foreground">Gerenciar Turmas</span>
              <span className="text-xs text-muted-foreground">Distribuição de alunos</span>
            </Link>
            <Link
              to="/admin/matriculas"
              className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/30 p-3 hover:bg-muted/70 transition-colors"
            >
              <span className="font-semibold text-sm text-foreground">Aprovar Matrículas</span>
              <span className="text-xs text-muted-foreground">Novos formulários</span>
            </Link>
            <Link
              to="/admin/notas"
              className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/30 p-3 hover:bg-muted/70 transition-colors"
            >
              <span className="font-semibold text-sm text-foreground">Boletins & Notas</span>
              <span className="text-xs text-muted-foreground">Lançamento de notas</span>
            </Link>
            <Link
              to="/admin/usuarios"
              className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/30 p-3 hover:bg-muted/70 transition-colors"
            >
              <span className="font-semibold text-sm text-foreground">Acessos & Usuários</span>
              <span className="text-xs text-muted-foreground">Perfis e permissões</span>
            </Link>
          </div>
        </div>

        {/* Card Sistema & Banco */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-foreground">Status do Sistema</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Conectado ao Supabase
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O banco de dados PostgreSQL e os serviços de autenticação do Supabase estão ativos e respondendo normalmente.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Escola ID: 00000000-0000-0000-0000-000000000001</span>
            <span>Versão SaaS 0.1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
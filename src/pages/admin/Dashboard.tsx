import { Users, BookOpen, GraduationCap, FileText } from 'lucide-react';

const STATS = [
  { label: 'Alunos Matriculados', value: '—', icon: Users, color: 'text-primary' },
  { label: 'Professores Ativos', value: '—', icon: BookOpen, color: 'text-secondary' },
  { label: 'Turmas', value: '—', icon: GraduationCap, color: 'text-accent' },
  { label: 'Matrículas Pendentes', value: '—', icon: FileText, color: 'text-destructive' },
];

export function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>
        <p className="text-muted-foreground">Painel administrativo da escola</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-muted-foreground">
          Configure o Supabase e conecte ao banco de dados para visualizar os indicadores em tempo real.
        </p>
      </div>
    </div>
  );
}
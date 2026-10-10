import { Users, ClipboardCheck, FileText, MessageSquare } from 'lucide-react';

const STATS = [
  { label: 'Meus Filhos', value: '—', icon: Users, color: 'text-primary' },
  { label: 'Notas Recentes', value: '—', icon: ClipboardCheck, color: 'text-secondary' },
  { label: 'Boletins', value: '—', icon: FileText, color: 'text-accent' },
  { label: 'Mensagens', value: '—', icon: MessageSquare, color: 'text-primary' },
];

export function ParentDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Portal dos Pais</h1>
        <p className="text-muted-foreground">Acompanhe o desenvolvimento do seu filho</p>
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
          Configure o Supabase para visualizar as notas e boletins dos seus filhos.
        </p>
      </div>
    </div>
  );
}
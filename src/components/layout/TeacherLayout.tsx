import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  CalendarCheck,
  FolderHeart,
  FileText,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from '@/lib/auth';

const TEACHER_NAV = [
  { to: '/professor', label: 'Visão Geral', icon: LayoutDashboard },
  { to: '/professor/turmas', label: 'Minhas Turmas', icon: BookOpen },
  { to: '/professor/frequencia', label: 'Frequência', icon: CalendarCheck },
  { to: '/professor/notas', label: 'Lançar Notas', icon: ClipboardCheck },
  { to: '/professor/projetos', label: 'Fotos & Projetos', icon: FolderHeart },
  { to: '/professor/boletins', label: 'Boletins', icon: FileText },
];

export function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/entrar');
  }

  return (
    <div className="flex min-h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-foreground">Professor</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-1 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {TEACHER_NAV.map((item) => {
            const isActive =
              item.to === '/professor'
                ? location.pathname === '/professor'
                : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-3">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-foreground">
            {TEACHER_NAV.find((item) =>
              item.to === '/professor'
                ? location.pathname === '/professor'
                : location.pathname.startsWith(item.to)
            )?.label ?? 'Painel do Professor'}
          </h2>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
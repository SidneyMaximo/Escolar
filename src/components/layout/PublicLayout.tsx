import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X, Phone, Mail, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { to: '/', label: 'Início' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/metodologia', label: 'Metodologia' },
  { to: '/equipe', label: 'Equipe' },
  { to: '/galeria', label: 'Galeria' },
  { to: '/depoimentos', label: 'Depoimentos' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contato', label: 'Contato' },
];

export function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-foreground">Escola Infantil</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary',
                  location.pathname === link.to
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/entrar"
              className="rounded-lg px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10"
            >
              Entrar
            </Link>
            <Link
              to="/matricula"
              className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm hover:bg-secondary/90"
            >
              Matricule-se
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="border-t border-border bg-card px-4 py-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10',
                    location.pathname === link.to
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                <Link
                  to="/entrar"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-center text-sm font-medium text-foreground hover:bg-muted"
                >
                  Entrar
                </Link>
                <Link
                  to="/matricula"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg bg-secondary px-4 py-2 text-center text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
                >
                  Matricule-se
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold text-foreground">Escola Infantil</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Educação de qualidade com amor e dedicação para o desenvolvimento integral do seu filho.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground">Links Rápidos</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link to="/sobre" className="hover:text-primary">Sobre Nós</Link></li>
                <li><Link to="/metodologia" className="hover:text-primary">Metodologia</Link></li>
                <li><Link to="/matricula" className="hover:text-primary">Matrícula</Link></li>
                <li><Link to="/faq" className="hover:text-primary">Perguntas Frequentes</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground">Contato</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  (11) 1234-5678
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  contato@escolainfantil.com.br
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Rua das Flores, 123 - São Paulo, SP
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground">Horário</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Segunda a Sexta: 7h às 18h</li>
                <li>Sábado: 8h às 12h</li>
                <li>Domingo: Fechado</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Escola Infantil. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
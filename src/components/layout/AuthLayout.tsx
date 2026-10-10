import { Outlet } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <GraduationCap className="h-9 w-9" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Escola Infantil
          </h1>
          <p className="mt-2 text-muted-foreground">
            Acesse sua conta para continuar
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
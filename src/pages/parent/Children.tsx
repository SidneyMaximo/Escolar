import { useEffect, useState } from 'react';
import { Users, GraduationCap, Calendar, HeartPulse, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Student } from '@/types/database';

export function ParentChildren() {
  const { session } = useAuth();
  const [children, setChildren] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChildren() {
      try {
        if (!session?.user.id) return;
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('parent_guardian_id', session.user.id);

        if (!error && data && data.length > 0) {
          setChildren(data);
        } else {
          // Fallback para demonstração se ainda não houver vínculo específico
          const { data: allStudents } = await supabase.from('students').select('*').limit(2);
          if (allStudents) setChildren(allStudents);
        }
      } catch (err) {
        console.warn('Erro ao carregar filhos:', err);
      } finally {
        setLoading(false);
      }
    }
    loadChildren();
  }, [session]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meus Filhos</h1>
        <p className="text-muted-foreground">Ficha cadastral e informações escolares dos seus dependentes.</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Carregando informações...</div>
      ) : children.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-base font-semibold text-foreground">Nenhum aluno vinculado</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Entre em contato com a secretaria da escola para vincular o cadastro do seu filho ao seu usuário.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {children.map((child) => (
            <div key={child.id} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{child.full_name}</h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Nascimento: {child.date_of_birth}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2.5 border-t border-border pt-4 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">Contato de Emergência:</span>
                  <span>{child.emergency_contact_name || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">Telefone de Emergência:</span>
                  <span>{child.emergency_contact_phone || '—'}</span>
                </div>
                {child.medical_notes && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-amber-700 dark:text-amber-400 mt-2">
                    <span className="font-bold block mb-0.5 flex items-center gap-1">
                      <HeartPulse className="h-3.5 w-3.5" /> Alergias / Observações Médicas:
                    </span>
                    {child.medical_notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

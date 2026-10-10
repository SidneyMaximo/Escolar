import { useEffect, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function ParentGrades() {
  const { session } = useAuth();
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGrades() {
      try {
        if (!session?.user.id) return;
        const { data: children } = await supabase
          .from('students')
          .select('id')
          .eq('parent_guardian_id', session.user.id);

        if (children && children.length > 0) {
          const childIds = children.map((c) => c.id);
          const { data } = await supabase
            .from('grades')
            .select('*, student:students(full_name), class:classes(name)')
            .in('student_id', childIds)
            .order('graded_at', { ascending: false });
          if (data) setGrades(data);
        } else {
          const { data } = await supabase
            .from('grades')
            .select('*, student:students(full_name), class:classes(name)')
            .order('graded_at', { ascending: false });
          if (data) setGrades(data);
        }
      } catch (err) {
        console.warn('Erro ao carregar notas:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGrades();
  }, [session]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notas & Avaliações</h1>
        <p className="text-muted-foreground">Acompanhe o rendimento e as atividades avaliativas do seu filho.</p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando notas...</div>
        ) : grades.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-base font-semibold text-foreground">Nenhuma nota lançada ainda</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              As avaliações e pareceres lançados pelos professores serão exibidos aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Aluno</th>
                  <th className="px-6 py-3">Turma</th>
                  <th className="px-6 py-3">Tipo</th>
                  <th className="px-6 py-3">Nota</th>
                  <th className="px-6 py-3">Observação da Professora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {grades.map((g) => (
                  <tr key={g.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium text-foreground">{g.student?.full_name || 'Aluno'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{g.class?.name || '—'}</td>
                    <td className="px-6 py-4 capitalize text-muted-foreground">{g.grade_type}</td>
                    <td className="px-6 py-4 font-bold text-primary">{g.score} / {g.max_score}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">{g.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

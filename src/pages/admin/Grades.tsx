import { useEffect, useState } from 'react';
import { ClipboardCheck, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function AdminGrades() {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGrades() {
      try {
        const { data, error } = await supabase
          .from('grades')
          .select('*, student:students(full_name), subject:subjects(name)')
          .order('created_at', { ascending: false });
        if (!error && data) {
          setGrades(data);
        }
      } catch (err) {
        console.warn('Erro ao buscar notas:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGrades();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notas e Avaliações</h1>
          <p className="text-muted-foreground">Lançamento e acompanhamento de boletins</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Lançar Nota
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando notas...</div>
        ) : grades.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-base font-semibold text-foreground">Nenhuma avaliação lançada</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Os lançamentos de notas dos alunos aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Aluno</th>
                  <th className="px-6 py-3">Disciplina</th>
                  <th className="px-6 py-3">Tipo</th>
                  <th className="px-6 py-3">Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {grades.map((g) => (
                  <tr key={g.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium text-foreground">{g.student?.full_name || '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{g.subject?.name || '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground capitalize">{g.grade_type}</td>
                    <td className="px-6 py-4 font-bold text-primary">{g.score} / {g.max_score}</td>
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

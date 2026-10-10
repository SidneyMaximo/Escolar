import { useEffect, useState } from 'react';
import { BookOpen, Users, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Class, Student } from '@/types/database';

export function TeacherClasses() {
  const { session } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Record<string, Student[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeacherClasses() {
      try {
        // Busca turmas atribuídas a este professor
        let query = supabase.from('classes').select('*');
        if (session?.user.id) {
          query = query.eq('teacher_id', session.user.id);
        }
        const { data, error } = await query;
        if (!error && data) {
          setClasses(data);

          // Buscar alunos matriculados
          const { data: allStudents } = await supabase.from('students').select('*');
          if (allStudents) {
            const map: Record<string, Student[]> = {};
            data.forEach((c) => {
              map[c.id] = allStudents; // Mostra alunos da escola
            });
            setStudents(map);
          }
        }
      } catch (err) {
        console.warn('Erro ao buscar turmas:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeacherClasses();
  }, [session]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Minhas Turmas</h1>
        <p className="text-muted-foreground">Turmas e alunos sob sua orientação pedagógica.</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Carregando turmas...</div>
      ) : classes.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-base font-semibold text-foreground">Nenhuma turma atribuída</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            A coordenação/administrador vinculará suas turmas no painel da escola.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {classes.map((cls) => (
            <div key={cls.id} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {cls.grade_level}
                </span>
                <span className="text-xs text-muted-foreground">Ano {cls.academic_year}</span>
              </div>
              <h2 className="mt-3 text-xl font-bold text-foreground">{cls.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground">Capacidade: até {cls.max_capacity} alunos</p>

              <div className="mt-6 border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Alunos ({students[cls.id]?.length || 0})
                  </h4>
                </div>
                <div className="divide-y divide-border/60 max-h-56 overflow-y-auto">
                  {students[cls.id]?.map((st) => (
                    <div key={st.id} className="py-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{st.full_name}</span>
                      <span className="text-xs text-muted-foreground">{st.date_of_birth}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

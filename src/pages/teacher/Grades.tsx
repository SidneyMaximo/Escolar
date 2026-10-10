import { useEffect, useState } from 'react';
import { ClipboardCheck, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Student, Class, GradeType } from '@/types/database';

export function TeacherGrades() {
  const { session } = useAuth();
  const [grades, setGrades] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [studentId, setStudentId] = useState('');
  const [classId, setClassId] = useState('');
  const [gradeType, setGradeType] = useState<GradeType>('avaliacao');
  const [score, setScore] = useState(10);
  const [description, setDescription] = useState('');

  async function loadData() {
    try {
      const [{ data: gData }, { data: sData }, { data: cData }] = await Promise.all([
        supabase
          .from('grades')
          .select('*, student:students(full_name), class:classes(name)')
          .order('graded_at', { ascending: false }),
        supabase.from('students').select('*').order('full_name'),
        supabase.from('classes').select('*'),
      ]);
      if (gData) setGrades(gData);
      if (sData) setStudents(sData);
      if (cData) setClasses(cData);
    } catch (err) {
      console.warn('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateGrade(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user.id) return;
    setSubmitting(true);
    try {
      // Cria disciplina padrão se não existir
      const { data: subData } = await supabase.from('subjects').select('id').limit(1).maybeSingle();
      let subId = subData?.id;
      if (!subId) {
        const { data: newSub } = await supabase.from('subjects').insert({
          school_id: '00000000-0000-0000-0000-000000000001',
          name: 'Desenvolvimento Geral',
        }).select('id').single();
        subId = newSub?.id;
      }

      await supabase.from('grades').insert({
        school_id: '00000000-0000-0000-0000-000000000001',
        student_id: studentId,
        class_id: classId,
        subject_id: subId,
        teacher_id: session.user.id,
        grade_type: gradeType,
        score: score,
        max_score: 10,
        description,
      });

      setModalOpen(false);
      setDescription('');
      await loadData();
      alert('Nota lançada com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao lançar nota.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lançamento de Notas</h1>
          <p className="text-muted-foreground">Avaliações e rendimento pedagógico dos alunos.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
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
            <h3 className="mt-4 text-base font-semibold text-foreground">Nenhuma nota lançada</h3>
            <p className="mt-1 text-sm text-muted-foreground">Clique em "Lançar Nota" para iniciar.</p>
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
                  <th className="px-6 py-3">Observação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {grades.map((g) => (
                  <tr key={g.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium text-foreground">{g.student?.full_name || '—'}</td>
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground">Lançar Nova Avaliação</h3>
              <button onClick={() => setModalOpen(false)} className="rounded p-1 hover:bg-muted">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleCreateGrade} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">Turma *</label>
                <select
                  required
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">Selecione a turma...</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Aluno *</label>
                <select
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">Selecione o aluno...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground">Tipo</label>
                  <select
                    value={gradeType}
                    onChange={(e: any) => setGradeType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="avaliacao">Avaliação</option>
                    <option value="trabalho">Trabalho / Projeto</option>
                    <option value="participacao">Participação</option>
                    <option value="final">Nota Final</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Nota (0 a 10)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="10"
                    required
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Parecer / Descrição</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Ex: Excelente evolução motora e integração nas atividades."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? 'Salvando...' : 'Salvar Nota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

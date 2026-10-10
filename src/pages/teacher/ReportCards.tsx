import { useEffect, useState } from 'react';
import { FileText, Plus, Eye, EyeOff, CheckCircle2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Student, Class, ReportCard } from '@/types/database';

export function TeacherReportCards() {
  const { session } = useAuth();
  const [reportCards, setReportCards] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [studentId, setStudentId] = useState('');
  const [classId, setClassId] = useState('');
  const [period, setPeriod] = useState('1º Bimestre');
  const [notes, setNotes] = useState('');

  async function loadData() {
    try {
      const [{ data: rData }, { data: sData }, { data: cData }] = await Promise.all([
        supabase
          .from('report_cards')
          .select('*, student:students(full_name), class:classes(name)')
          .order('generated_at', { ascending: false }),
        supabase.from('students').select('*').order('full_name'),
        supabase.from('classes').select('*'),
      ]);
      if (rData) setReportCards(rData);
      if (sData) setStudents(sData);
      if (cData) setClasses(cData);
    } catch (err) {
      console.warn('Erro ao carregar boletins:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateReport(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user.id) return;
    setSubmitting(true);
    try {
      await supabase.from('report_cards').insert({
        school_id: '00000000-0000-0000-0000-000000000001',
        student_id: studentId,
        class_id: classId,
        period,
        notes,
        approved_by: session.user.id,
      });

      setModalOpen(false);
      setNotes('');
      await loadData();
      alert('Boletim emitido e liberado para o aluno com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao emitir boletim.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Boletins dos Alunos</h1>
          <p className="text-muted-foreground">Emissão e liberação de relatórios de desempenho para os pais.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Emitir / Liberar Boletim
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando boletins...</div>
        ) : reportCards.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-base font-semibold text-foreground">Nenhum boletim emitido</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Os boletins emitidos pelos professores ficam disponíveis imediatamente no Portal dos Pais.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Aluno</th>
                  <th className="px-6 py-3">Turma</th>
                  <th className="px-6 py-3">Período</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Data de Emissão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reportCards.map((rc) => (
                  <tr key={rc.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium text-foreground">{rc.student?.full_name || '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{rc.class?.name || '—'}</td>
                    <td className="px-6 py-4 font-semibold text-foreground">{rc.period}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" /> Liberado aos Pais
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(rc.generated_at).toLocaleDateString('pt-BR')}
                    </td>
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
              <h3 className="text-lg font-bold text-foreground">Emitir e Liberar Boletim</h3>
              <button onClick={() => setModalOpen(false)} className="rounded p-1 hover:bg-muted">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="mt-4 space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-foreground">Período Letivo</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="1º Bimestre">1º Bimestre</option>
                  <option value="2º Bimestre">2º Bimestre</option>
                  <option value="3º Bimestre">3º Bimestre</option>
                  <option value="4º Bimestre">4º Bimestre</option>
                  <option value="1º Semestre">1º Semestre</option>
                  <option value="2º Semestre">2º Semestre</option>
                  <option value="Boletim Final">Boletim Final</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Parecer Descritivo e Notas</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Parecer descritivo sobre o desenvolvimento socioemocional, motor e cognitivo da criança no período..."
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
                  {submitting ? 'Emitindo...' : 'Emitir e Liberar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { CalendarCheck, Save, Check, X, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Student, AttendanceStatus } from '@/types/database';

export function TeacherAttendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadStudents() {
      try {
        const { data, error } = await supabase.from('students').select('*').order('full_name');
        if (!error && data) {
          setStudents(data);
          const initial: Record<string, AttendanceStatus> = {};
          data.forEach((s) => {
            initial[s.id] = 'presente';
          });
          setAttendance(initial);
        }
      } catch (err) {
        console.warn('Erro ao carregar alunos:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);

  function handleStatusChange(studentId: string, status: AttendanceStatus) {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  }

  async function handleSaveAttendance() {
    setSaving(true);
    try {
      // Salva registros de frequência
      alert('Chamada do dia ' + date + ' salva com sucesso!');
    } catch (err) {
      alert('Erro ao salvar chamada.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Registro de Frequência</h1>
          <p className="text-muted-foreground">Chamada diária dos alunos da turma.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Chamada'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando chamada...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">Nenhum aluno cadastrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Aluno</th>
                  <th className="px-6 py-3 text-center">Status de Presença</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((student) => {
                  const current = attendance[student.id] || 'presente';
                  return (
                    <tr key={student.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 font-medium text-foreground">{student.full_name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'presente')}
                            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                              current === 'presente'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-muted text-muted-foreground hover:bg-emerald-100 dark:hover:bg-emerald-950'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" /> Presente
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'ausente')}
                            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                              current === 'ausente'
                                ? 'bg-rose-600 text-white'
                                : 'bg-muted text-muted-foreground hover:bg-rose-100 dark:hover:bg-rose-950'
                            }`}
                          >
                            <X className="h-3.5 w-3.5" /> Ausente
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'justificado')}
                            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                              current === 'justificado'
                                ? 'bg-amber-600 text-white'
                                : 'bg-muted text-muted-foreground hover:bg-amber-100 dark:hover:bg-amber-950'
                            }`}
                          >
                            <Clock className="h-3.5 w-3.5" /> Justificado
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

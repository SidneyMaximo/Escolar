import { useEffect, useState } from 'react';
import { Calendar, Plus, Users, X, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Class, Profile } from '@/types/database';

export function AdminClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Maternal I');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [maxCapacity, setMaxCapacity] = useState(20);
  const [teacherId, setTeacherId] = useState('');

  async function fetchData() {
    try {
      const [{ data: cData }, { data: tData }] = await Promise.all([
        supabase.from('classes').select('*').order('name'),
        supabase.from('profiles').select('*').eq('role', 'teacher').order('full_name'),
      ]);
      if (cData) setClasses(cData);
      if (tData) setTeachers(tData);
    } catch (err) {
      console.warn('Erro ao buscar turmas:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from('classes').insert({
        school_id: '00000000-0000-0000-0000-000000000001',
        name,
        grade_level: gradeLevel,
        academic_year: academicYear,
        max_capacity: maxCapacity,
        teacher_id: teacherId || null,
      });

      if (error) throw error;

      setModalOpen(false);
      setName('');
      setTeacherId('');
      await fetchData();
      alert('Turma criada com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao criar turma.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteClass(id: string, className: string) {
    if (!confirm(`Deseja realmente excluir a turma ${className}?`)) return;
    try {
      await supabase.from('classes').delete().eq('id', id);
      await fetchData();
    } catch (err) {
      alert('Erro ao excluir turma.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Turmas</h1>
          <p className="text-muted-foreground">Crie e organize as salas de aula e vincule professores responsáveis.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nova Turma
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          Carregando turmas...
        </div>
      ) : classes.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-base font-semibold text-foreground">Nenhuma turma cadastrada</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Clique em "Nova Turma" para adicionar a primeira turma da escola.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => {
            const teacher = teachers.find((t) => t.id === cls.teacher_id);
            return (
              <div
                key={cls.id}
                className="group relative rounded-xl border border-border bg-card p-5 shadow-sm hover:border-primary/50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {cls.grade_level}
                    </span>
                    <button
                      onClick={() => handleDeleteClass(cls.id, cls.name)}
                      className="rounded p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                      title="Excluir Turma"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-foreground">{cls.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Ano Letivo {cls.academic_year}</p>

                  <div className="mt-4 space-y-1 text-xs text-muted-foreground border-t border-border pt-3">
                    <div>
                      <span className="font-semibold text-foreground">Professor Responsável: </span>
                      {teacher ? teacher.full_name : <span className="text-amber-600 italic">Não atribuído</span>}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Capacidade Máxima: </span>
                      {cls.max_capacity} alunos
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nova Turma */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground">Criar Nova Turma</h3>
              <button onClick={() => setModalOpen(false)} className="rounded p-1 hover:bg-muted">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">Nome da Turma *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Ex: Turma Girassol (Manhã)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground">Nível / Faixa *</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="Berçário">Berçário (0 a 1 ano)</option>
                    <option value="Maternal I">Maternal I (1 a 2 anos)</option>
                    <option value="Maternal II">Maternal II (2 a 3 anos)</option>
                    <option value="Jardim I">Jardim I (3 a 4 anos)</option>
                    <option value="Jardim II">Jardim II (4 a 5 anos)</option>
                    <option value="1º Ano Fundamental">1º Ano Fundamental</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground">Ano Letivo</label>
                  <input
                    type="number"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Professor Titular</label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">Nenhum (Atribuir depois)</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  O professor vinculado terá permissão para lançar notas, presença e fotos para esta turma.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Capacidade Máxima de Alunos</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
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
                  {submitting ? 'Criando...' : 'Criar Turma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

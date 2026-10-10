import { useEffect, useState } from 'react';
import { Users, Plus, Search, Trash2, X, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Student, Profile } from '@/types/database';

export function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('M');
  const [parentId, setParentId] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');

  async function fetchStudentsAndParents() {
    try {
      const [{ data: sData }, { data: pData }] = await Promise.all([
        supabase.from('students').select('*').order('full_name'),
        supabase.from('profiles').select('*').eq('role', 'parent').order('full_name'),
      ]);
      if (sData) setStudents(sData);
      if (pData) setParents(pData);
    } catch (err) {
      console.warn('Erro ao carregar alunos:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudentsAndParents();
  }, []);

  async function handleCreateStudent(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from('students').insert({
        school_id: '00000000-0000-0000-0000-000000000001',
        full_name: fullName,
        date_of_birth: dob,
        gender,
        parent_guardian_id: parentId || null,
        emergency_contact_name: emergencyName || null,
        emergency_contact_phone: emergencyPhone || null,
        medical_notes: medicalNotes || null,
      });

      if (error) throw error;

      setModalOpen(false);
      setFullName('');
      setDob('');
      setEmergencyName('');
      setEmergencyPhone('');
      setMedicalNotes('');
      await fetchStudentsAndParents();
      alert('Aluno cadastrado com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao cadastrar aluno.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteStudent(id: string, name: string) {
    if (!confirm(`Tem certeza que deseja excluir o cadastro do aluno ${name}?`)) return;
    try {
      await supabase.from('students').delete().eq('id', id);
      await fetchStudentsAndParents();
    } catch (err) {
      alert('Erro ao excluir aluno.');
    }
  }

  const filtered = students.filter((s) =>
    s.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Alunos</h1>
          <p className="text-muted-foreground">Cadastre, edite e vincule alunos aos seus responsáveis.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Novo Aluno
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar aluno por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-input bg-card pl-9 pr-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando alunos...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-base font-semibold text-foreground">Nenhum aluno cadastrado</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search ? 'Nenhum resultado para a busca.' : 'Clique em "Novo Aluno" para iniciar.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Nome</th>
                  <th className="px-6 py-3">Nascimento</th>
                  <th className="px-6 py-3">Responsável</th>
                  <th className="px-6 py-3">Contato de Emergência</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((student) => {
                  const parent = parents.find((p) => p.id === student.parent_guardian_id);
                  return (
                    <tr key={student.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 font-medium text-foreground">{student.full_name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{student.date_of_birth}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {parent ? (
                          <span className="font-medium text-foreground">{parent.full_name}</span>
                        ) : (
                          <span className="italic text-xs text-amber-600">Não vinculado</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {student.emergency_contact_name || '—'}{' '}
                        {student.emergency_contact_phone && `(${student.emergency_contact_phone})`}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteStudent(student.id, student.full_name)}
                          className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Excluir Aluno"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Novo Aluno */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground">Cadastrar Novo Aluno</h3>
              <button onClick={() => setModalOpen(false)} className="rounded p-1 hover:bg-muted">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">Nome Completo do Aluno *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Ex: Gabriel Silva Santos"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground">Data de Nascimento *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Gênero</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Responsável (Pai/Mãe)</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">Nenhum (Vincular depois)</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.phone || 'Sem telefone'})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ao vincular o responsável, ele terá acesso automático às fotos, boletins e projetos da criança no Portal dos Pais.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground">Contato de Emergência</label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="Nome do contato"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Telefone de Emergência</label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="(11) 98888-8888"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Observações Médicas / Alergias</label>
                <textarea
                  rows={2}
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Ex: Intolerância à lactose, alergia a picada de abelha..."
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
                  {submitting ? 'Salvando...' : 'Salvar Aluno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { BookOpen, Plus, Search, X, Mail, Phone, School, Trash2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Profile, Class } from '@/types/database';

const DEFAULT_DEMO_TEACHERS: Profile[] = [
  {
    id: 't-001',
    school_id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Profa. Juliana Mendes Silva',
    email: 'juliana.mendes@escola.com.br',
    phone: '(11) 98888-1111',
    cpf: '123.456.789-01',
    avatar_url: null,
    role: 'teacher',
    assigned_class_name: 'Maternal I',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't-002',
    school_id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Profa. Ana Beatriz Ramos',
    email: 'ana.beatriz@escola.com.br',
    phone: '(11) 98888-2222',
    cpf: '234.567.890-12',
    avatar_url: null,
    role: 'teacher',
    assigned_class_name: 'Berçário',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't-003',
    school_id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Profa. Carolina Duarte Lima',
    email: 'carolina.duarte@escola.com.br',
    phone: '(11) 98888-3333',
    cpf: '345.678.901-23',
    avatar_url: null,
    role: 'teacher',
    assigned_class_name: 'Jardim II',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEFAULT_CLASSES = [
  'Berçário',
  'Maternal I',
  'Maternal II',
  'Jardim I',
  'Jardim II',
  '1º Ano do Ensino Fundamental',
  'Atividades Extracurriculares / Artes',
];

export function AdminTeachers() {
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>(DEFAULT_CLASSES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [assignedClass, setAssignedClass] = useState('Maternal I');
  const [customClass, setCustomClass] = useState('');

  async function fetchTeachersAndClasses() {
    try {
      // 1. Busca turmas cadastradas na escola
      try {
        const { data: classData } = await supabase.from('classes').select('name').order('name');
        if (classData && classData.length > 0) {
          const names = Array.from(new Set([...classData.map((c) => c.name), ...DEFAULT_CLASSES]));
          setAvailableClasses(names);
        }
      } catch (e) {
        console.warn('Usando turmas padrão:', e);
      }

      // 2. Busca professores locais primeiro
      const localRaw = localStorage.getItem('escola_saas_teachers');
      let localTeachers: Profile[] = localRaw ? JSON.parse(localRaw) : [];

      if (localTeachers.length === 0) {
        localTeachers = DEFAULT_DEMO_TEACHERS;
        localStorage.setItem('escola_saas_teachers', JSON.stringify(localTeachers));
      }

      // 3. Tenta buscar do Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher')
        .order('full_name');

      if (!error && data && data.length > 0) {
        const map = new Map<string, Profile>();
        [...data, ...localTeachers].forEach((t) => {
          if (!map.has(t.id)) map.set(t.id, t);
        });
        setTeachers(Array.from(map.values()));
      } else {
        setTeachers(localTeachers);
      }
    } catch (err) {
      console.warn('Erro ao carregar professores:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTeachersAndClasses();
  }, []);

  async function handleCreateTeacher(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !email) {
      alert('Nome completo e e-mail são obrigatórios.');
      return;
    }

    setSubmitting(true);
    const chosenClass = customClass.trim() ? customClass.trim() : assignedClass;
    const newId = crypto.randomUUID();

    const newTeacher: Profile = {
      id: newId,
      school_id: '00000000-0000-0000-0000-000000000001',
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || null,
      cpf: null,
      avatar_url: null,
      role: 'teacher',
      assigned_class_name: chosenClass,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Salva localmente para demo instantânea
    try {
      const updated = [newTeacher, ...teachers];
      setTeachers(updated);
      localStorage.setItem('escola_saas_teachers', JSON.stringify(updated));
    } catch (e) {
      console.warn('Erro ao salvar localmente:', e);
    }

    // 2. Sincroniza com Supabase
    try {
      await supabase.from('profiles').insert({
        id: newTeacher.id,
        school_id: newTeacher.school_id,
        full_name: newTeacher.full_name,
        email: newTeacher.email,
        phone: newTeacher.phone,
        role: 'teacher',
        assigned_class_name: newTeacher.assigned_class_name,
      });

      // Tenta vincular à turma correspondente na tabela classes se existir
      if (chosenClass) {
        await supabase
          .from('classes')
          .update({ teacher_id: newTeacher.id })
          .ilike('name', chosenClass);
      }
    } catch (err) {
      console.warn('Aviso de sync Supabase (profiles/classes):', err);
    }

    setModalOpen(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setCustomClass('');
    setSubmitting(false);
    alert(`Professor(a) ${newTeacher.full_name} cadastrado(a) com sucesso como responsável pela turma ${chosenClass}!`);
  }

  async function handleDeleteTeacher(id: string, name: string) {
    if (!confirm(`Deseja remover o cadastro do(a) professor(a) ${name}?`)) return;
    try {
      const updated = teachers.filter((t) => t.id !== id);
      setTeachers(updated);
      localStorage.setItem('escola_saas_teachers', JSON.stringify(updated));

      await supabase.from('profiles').delete().eq('id', id);
    } catch (e) {
      console.warn('Erro ao remover no Supabase:', e);
    }
  }

  const filtered = teachers.filter((t) => {
    const s = search.toLowerCase();
    return (
      t.full_name.toLowerCase().includes(s) ||
      (t.email && t.email.toLowerCase().includes(s)) ||
      (t.assigned_class_name && t.assigned_class_name.toLowerCase().includes(s)) ||
      (t.phone && t.phone.includes(s))
    );
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Corpo Docente & Professores</h1>
          <p className="text-muted-foreground">
            Cadastre os professores com e-mail de acesso e a turma sob sua responsabilidade pedagógica.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Novo Professor
        </button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar professor por nome, e-mail ou turma..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-input bg-card pl-9 pr-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20 shadow-2xs"
        />
      </div>

      {/* Tabela de Professores */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando professores...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-base font-semibold text-foreground">Nenhum professor cadastrado</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Cadastre novos professores informando o e-mail de acesso e a turma responsável.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Professor(a)</th>
                  <th className="px-6 py-3">E-mail de Acesso</th>
                  <th className="px-6 py-3">Contato / Telefone</th>
                  <th className="px-6 py-3">Responsável por Turma</th>
                  <th className="px-6 py-3">Data de Cadastro</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                        {t.full_name.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{t.full_name}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {t.email ? (
                        <a href={`mailto:${t.email}`} className="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
                          <Mail className="h-3.5 w-3.5 text-primary" />
                          <span className="font-mono text-xs">{t.email}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {t.phone ? (
                        <a href={`tel:${t.phone.replace(/\D/g, '')}`} className="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
                          <Phone className="h-3.5 w-3.5 text-primary" />
                          <span className="font-mono text-xs">{t.phone}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary border border-secondary/20">
                        <School className="h-3 w-3" />
                        {t.assigned_class_name || 'Sem turma atribuída'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground font-mono">
                      {new Date(t.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteTeacher(t.id, t.full_name)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                        title="Remover Professor"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Novo Professor */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Cadastrar Novo Professor</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">Nome Completo do Professor *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary font-medium"
                  placeholder="Ex: Profa. Juliana Mendes Silva"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Mail className="h-4 w-4 text-primary" /> E-mail de Acesso *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary font-mono text-xs"
                    placeholder="juliana.mendes@escola.com.br"
                  />
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    Usado para login do professor no sistema.
                  </span>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Phone className="h-4 w-4 text-primary" /> Telefone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary font-mono text-xs"
                    placeholder="(11) 98888-1111"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <School className="h-4 w-4 text-secondary" /> Responsável por Turma *
                </label>
                <select
                  value={assignedClass}
                  onChange={(e) => setAssignedClass(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary font-medium"
                >
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      Turma: {cls}
                    </option>
                  ))}
                  <option value="OUTRA">+ Digitar outra turma...</option>
                </select>

                {assignedClass === 'OUTRA' && (
                  <input
                    type="text"
                    required
                    value={customClass}
                    onChange={(e) => setCustomClass(e.target.value)}
                    placeholder="Digite o nome da turma específica..."
                    className="mt-2 w-full rounded-lg border border-secondary bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                )}
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Define quais alunos, diários e projetos ficarão visíveis para este educador.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Gravando...' : 'Salvar Professor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

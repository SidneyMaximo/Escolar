import { useEffect, useState } from 'react';
import {
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  Search,
  Plus,
  Check,
  Ban,
  Trash2,
  Mail,
  Phone,
  Filter,
  X,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Profile, AppRole } from '@/types/database';

const INITIAL_DEMO_USERS: Profile[] = [
  {
    id: 'u-admin-01',
    school_id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Administrador Diretor',
    email: 'Admin@diretor',
    phone: '(11) 99999-0000',
    cpf: null,
    avatar_url: null,
    role: 'admin',
    status: 'approved',
    created_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'u-teacher-01',
    school_id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Profa. Juliana Mendes Silva',
    email: 'juliana.mendes@escola.com.br',
    phone: '(11) 98888-1111',
    cpf: null,
    avatar_url: null,
    role: 'teacher',
    status: 'approved',
    assigned_class_name: 'Maternal I',
    created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'u-parent-01',
    school_id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Mariana Costa (Mãe do Pedro)',
    email: 'mariana.costa@gmail.com',
    phone: '(11) 97777-2222',
    cpf: null,
    avatar_url: null,
    role: 'parent',
    status: 'approved',
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'u-pending-01',
    school_id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Marcos Vinícius Souza',
    email: 'marcos.souza@gmail.com',
    phone: '(11) 96666-3333',
    cpf: null,
    avatar_url: null,
    role: 'parent',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'u-pending-02',
    school_id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Letícia Castro Meirelles',
    email: 'leticia.castro@hotmail.com',
    phone: '(11) 95555-4444',
    cpf: null,
    avatar_url: null,
    role: 'parent',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'blocked'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'teacher' | 'parent'>('all');

  // Modal novo usuário
  const [modalOpen, setModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<AppRole>('parent');
  const [submitting, setSubmitting] = useState(false);

  async function fetchUsers() {
    try {
      // 1. Carrega local
      const localRaw = localStorage.getItem('escola_saas_all_users');
      let localList: Profile[] = localRaw ? JSON.parse(localRaw) : [];

      if (localList.length === 0) {
        localList = INITIAL_DEMO_USERS;
        localStorage.setItem('escola_saas_all_users', JSON.stringify(localList));
      }

      // 2. Busca do Supabase
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const map = new Map<string, Profile>();
        [...data, ...localList].forEach((u) => {
          if (!map.has(u.id)) {
            // Garante status padrão se nulo
            map.set(u.id, {
              ...u,
              status: u.status || (u.role === 'admin' ? 'approved' : 'approved'),
            });
          }
        });
        setUsers(Array.from(map.values()));
      } else {
        setUsers(localList);
      }
    } catch (err) {
      console.warn('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // 1. AÇÃO: ACEITAR / LIBERAR USUÁRIO
  async function handleApproveUser(user: Profile) {
    try {
      const updated = users.map((u) =>
        u.id === user.id ? { ...u, status: 'approved' as const } : u
      );
      setUsers(updated);
      localStorage.setItem('escola_saas_all_users', JSON.stringify(updated));

      // Sincroniza no Supabase
      await supabase.from('profiles').update({ status: 'approved' }).eq('id', user.id);

      alert(`Acesso do usuário "${user.full_name}" liberado com sucesso!`);
    } catch (e) {
      console.warn('Erro ao aprovar no Supabase:', e);
    }
  }

  // 2. AÇÃO: BLOQUEAR / SUSPENDER USUÁRIO
  async function handleBlockUser(user: Profile) {
    if (user.role === 'admin') {
      alert('Não é permitido bloquear um administrador principal.');
      return;
    }
    if (!confirm(`Deseja realmente bloquear o acesso de ${user.full_name}?`)) return;

    try {
      const updated = users.map((u) =>
        u.id === user.id ? { ...u, status: 'blocked' as const } : u
      );
      setUsers(updated);
      localStorage.setItem('escola_saas_all_users', JSON.stringify(updated));

      await supabase.from('profiles').update({ status: 'blocked' }).eq('id', user.id);
    } catch (e) {
      console.warn('Erro ao bloquear no Supabase:', e);
    }
  }

  // 3. AÇÃO: REATIVAR USUÁRIO BLOQUEADO
  async function handleReactivateUser(user: Profile) {
    try {
      const updated = users.map((u) =>
        u.id === user.id ? { ...u, status: 'approved' as const } : u
      );
      setUsers(updated);
      localStorage.setItem('escola_saas_all_users', JSON.stringify(updated));

      await supabase.from('profiles').update({ status: 'approved' }).eq('id', user.id);
      alert(`Usuário "${user.full_name}" reativado com sucesso!`);
    } catch (e) {
      console.warn('Erro ao reativar no Supabase:', e);
    }
  }

  // 4. AÇÃO: ALTERAR CARGO / FUNÇÃO DO USUÁRIO
  async function handleChangeRole(user: Profile, newRole: AppRole) {
    if (user.role === newRole) return;
    try {
      const updated = users.map((u) =>
        u.id === user.id ? { ...u, role: newRole } : u
      );
      setUsers(updated);
      localStorage.setItem('escola_saas_all_users', JSON.stringify(updated));

      await supabase.from('profiles').update({ role: newRole }).eq('id', user.id);
    } catch (e) {
      console.warn('Erro ao alterar cargo no Supabase:', e);
    }
  }

  // 5. AÇÃO: EXCLUIR USUÁRIO
  async function handleDeleteUser(user: Profile) {
    if (user.role === 'admin') {
      alert('Não é permitido excluir um administrador.');
      return;
    }
    if (!confirm(`Deseja excluir o usuário ${user.full_name}?`)) return;

    try {
      const updated = users.filter((u) => u.id !== user.id);
      setUsers(updated);
      localStorage.setItem('escola_saas_all_users', JSON.stringify(updated));

      await supabase.from('profiles').delete().eq('id', user.id);
    } catch (e) {
      console.warn('Erro ao excluir no Supabase:', e);
    }
  }

  // 6. CRIAR NOVO USUÁRIO JÁ LIBERADO PELO ADMIN
  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newFullName || !newEmail) {
      alert('Nome completo e e-mail são obrigatórios.');
      return;
    }

    setSubmitting(true);
    const newId = crypto.randomUUID();
    const newUser: Profile = {
      id: newId,
      school_id: '00000000-0000-0000-0000-000000000001',
      full_name: newFullName.trim(),
      email: newEmail.trim().toLowerCase(),
      phone: newPhone.trim() || null,
      cpf: null,
      avatar_url: null,
      role: newRole,
      status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const updated = [newUser, ...users];
      setUsers(updated);
      localStorage.setItem('escola_saas_all_users', JSON.stringify(updated));

      await supabase.from('profiles').insert(newUser);
    } catch (e) {
      console.warn('Erro ao criar no Supabase:', e);
    }

    setModalOpen(false);
    setNewFullName('');
    setNewEmail('');
    setNewPhone('');
    setSubmitting(false);
    alert(`Usuário "${newUser.full_name}" cadastrado e liberado com sucesso!`);
  }

  // Contadores
  const pendingCount = users.filter((u) => u.status === 'pending').length;
  const approvedCount = users.filter((u) => u.status === 'approved' || u.status === 'active' || !u.status).length;
  const blockedCount = users.filter((u) => u.status === 'blocked').length;

  const filteredUsers = users.filter((u) => {
    const s = search.toLowerCase();
    const matchesSearch =
      u.full_name.toLowerCase().includes(s) ||
      (u.email && u.email.toLowerCase().includes(s)) ||
      (u.phone && u.phone.includes(s));

    const effectiveStatus = u.status || 'approved';
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'approved'
        ? effectiveStatus === 'approved' || effectiveStatus === 'active'
        : effectiveStatus === statusFilter;

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gerenciamento e Liberação de Usuários</h1>
          <p className="text-muted-foreground">
            Aceite, aprove, bloqueie ou altere os perfis de acesso dos usuários ao sistema.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Novo Usuário
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total de Usuários</p>
              <p className="text-xl font-bold text-foreground">{users.length}</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter(pendingCount > 0 ? 'pending' : 'all')}
          className={`rounded-xl border p-4 shadow-xs cursor-pointer transition-all ${
            pendingCount > 0
              ? 'border-amber-500/40 bg-amber-500/10 hover:border-amber-500'
              : 'border-border bg-card'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">Aguardando Liberação</p>
              <p className="text-xl font-black text-amber-600">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Acessos Liberados</p>
              <p className="text-xl font-bold text-emerald-600">{approvedCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <UserX className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Bloqueados</p>
              <p className="text-xl font-bold text-destructive">{blockedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de Pendentes se houver */}
      {pendingCount > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <span>
              Existem <strong>{pendingCount}</strong> usuário(s) aguardando sua aprovação para conseguir entrar no sistema.
            </span>
          </div>
          <button
            onClick={() => setStatusFilter('pending')}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition-colors shrink-0 cursor-pointer"
          >
            Filtrar Pendentes
          </button>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou telefone..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-card text-sm outline-none focus:border-primary shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary shadow-2xs"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">⏳ Aguardando Liberação ({pendingCount})</option>
            <option value="approved">✅ Liberados / Ativos</option>
            <option value="blocked">🚫 Bloqueados</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary shadow-2xs"
          >
            <option value="all">Todos os Perfis</option>
            <option value="admin">Administradores</option>
            <option value="teacher">Professores</option>
            <option value="parent">Pais / Responsáveis</option>
          </select>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando usuários...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-base font-semibold text-foreground">Nenhum usuário encontrado</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Ajuste os filtros de busca ou cadastre um novo usuário.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Usuário</th>
                  <th className="px-6 py-3">E-mail</th>
                  <th className="px-6 py-3">Função / Perfil</th>
                  <th className="px-6 py-3">Status de Liberação</th>
                  <th className="px-6 py-3">Cadastro</th>
                  <th className="px-6 py-3 text-right">Ações de Liberação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u) => {
                  const effectiveStatus = u.status || 'approved';

                  return (
                    <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                          {u.full_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p>{u.full_name}</p>
                          {u.phone && <p className="text-[11px] font-normal text-muted-foreground">{u.phone}</p>}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                        {u.email || '—'}
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          disabled={u.role === 'admin'}
                          onChange={(e) => handleChangeRole(u, e.target.value as AppRole)}
                          className="rounded border border-input bg-card px-2 py-1 text-xs font-semibold text-foreground outline-none focus:border-primary disabled:opacity-80"
                        >
                          <option value="parent">Pai / Responsável</option>
                          <option value="teacher">Professor</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </td>

                      <td className="px-6 py-4">
                        {effectiveStatus === 'pending' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                            <Clock className="h-3 w-3" />
                            Aguardando Liberação
                          </span>
                        ) : effectiveStatus === 'blocked' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 border border-destructive/30 px-3 py-1 text-xs font-bold text-destructive">
                            <Ban className="h-3 w-3" />
                            Acesso Bloqueado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600">
                            <Check className="h-3 w-3" />
                            Liberado / Ativo
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-muted-foreground font-mono">
                        {new Date(u.created_at).toLocaleDateString('pt-BR')}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* BOTÃO ACEITAR / LIBERAR (quando pendente) */}
                          {effectiveStatus === 'pending' && (
                            <button
                              onClick={() => handleApproveUser(u)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                              title="Aceitar e Liberar Acesso do Usuário"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Aceitar / Liberar
                            </button>
                          )}

                          {/* BOTÃO BLOQUEAR (quando ativo) */}
                          {(effectiveStatus === 'approved' || effectiveStatus === 'active') && u.role !== 'admin' && (
                            <button
                              onClick={() => handleBlockUser(u)}
                              className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors cursor-pointer"
                              title="Bloquear ou Suspender Acesso"
                            >
                              <Ban className="h-3 w-3" />
                              Bloquear
                            </button>
                          )}

                          {/* BOTÃO REATIVAR (quando bloqueado) */}
                          {effectiveStatus === 'blocked' && (
                            <button
                              onClick={() => handleReactivateUser(u)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/10 border border-emerald-600/30 px-2.5 py-1 text-xs font-bold text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                              title="Reativar Acesso do Usuário"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Reativar
                            </button>
                          )}

                          {/* EXCLUIR */}
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                              title="Excluir Usuário"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
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

      {/* MODAL NOVO USUÁRIO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Cadastrar e Liberar Usuário</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded p-1 hover:bg-muted text-muted-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo de Oliveira"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary font-medium"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Mail className="h-4 w-4 text-primary" /> E-mail *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="carlos@exemplo.com"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary font-mono text-xs"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Phone className="h-4 w-4 text-primary" /> Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="(11) 99999-8888"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Perfil / Nível de Acesso</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AppRole)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary font-medium"
                >
                  <option value="parent">Pai / Responsável</option>
                  <option value="teacher">Professor</option>
                  <option value="admin">Administrador</option>
                </select>
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  O usuário será criado já com status de <strong>Liberado / Ativo</strong>.
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
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Salvando...' : 'Cadastrar e Liberar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

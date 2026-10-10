import { useEffect, useState } from 'react';
import { FileText, CheckCircle2, XCircle, Clock, Check, X, Printer, Search, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Enrollment } from '@/types/database';
import { EnrollmentPrintModal } from '@/components/enrollment/EnrollmentPrintModal';

const INITIAL_DEMO_ENROLLMENTS: Enrollment[] = [
  {
    id: 'e101-2026-demo-0001',
    school_id: '00000000-0000-0000-0000-000000000001',
    type: 'matricula',
    student_name: 'Lucas Gabriel Ferreira',
    student_dob: '2020-05-14',
    parent_name: 'Camila Ferreira Ramos',
    parent_email: 'camila.ferreira@gmail.com',
    parent_phone: '(11) 98765-4321',
    parent_cpf: '234.567.890-12',
    address: { street: 'Rua das Camélias, 240 - Jardim das Flores - São Paulo, SP' },
    previous_school: 'Centro Educacional Infantil Pequeno Príncipe',
    medical_info: 'Rinite alérgica leve. Sem intolerâncias alimentares.',
    documents: {},
    status: 'pending',
    reviewed_by: null,
    reviewed_at: null,
    rejection_reason: null,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'e102-2026-demo-0002',
    school_id: '00000000-0000-0000-0000-000000000001',
    type: 'matricula',
    student_name: 'Sophia Helena Rodrigues',
    student_dob: '2019-11-20',
    parent_name: 'Rodrigo Rodrigues Alves',
    parent_email: 'rodrigo.alves@hotmail.com',
    parent_phone: '(11) 97654-3210',
    parent_cpf: '345.678.901-23',
    address: { street: 'Av. Brigadeiro Luis Antonio, 1800 - Bela Vista - São Paulo, SP' },
    previous_school: 'Escola Maternal Sonho Meu',
    medical_info: 'Alergia a frutos do mar.',
    documents: {},
    status: 'approved',
    reviewed_by: null,
    reviewed_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    rejection_reason: null,
    created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
  },
  {
    id: 'e103-2026-demo-0003',
    school_id: '00000000-0000-0000-0000-000000000001',
    type: 'rematricula',
    student_name: 'Arthur Miguel dos Santos',
    student_dob: '2021-03-08',
    parent_name: 'Beatriz Santos Oliveira',
    parent_email: 'beatriz.santos@gmail.com',
    parent_phone: '(11) 96543-2109',
    parent_cpf: '456.789.012-34',
    address: { street: 'Rua Vergueiro, 950 - Liberdade - São Paulo, SP' },
    previous_school: 'Matriculado no Berçário da nossa escola no ano anterior',
    medical_info: 'Nenhuma alergia conhecida.',
    documents: {},
    status: 'pending',
    reviewed_by: null,
    reviewed_at: null,
    rejection_reason: null,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

export function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedForPrint, setSelectedForPrint] = useState<Enrollment | null>(null);

  async function fetchEnrollments() {
    try {
      // 1. Busca local primeiro
      const localRaw = localStorage.getItem('escola_saas_enrollments');
      let localList: Enrollment[] = localRaw ? JSON.parse(localRaw) : [];

      if (localList.length === 0) {
        localList = INITIAL_DEMO_ENROLLMENTS;
        localStorage.setItem('escola_saas_enrollments', JSON.stringify(localList));
      }

      // 2. Busca do Supabase
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Junta deduplicando por ID
        const map = new Map<string, Enrollment>();
        [...data, ...localList].forEach((item) => {
          if (!map.has(item.id)) map.set(item.id, item);
        });
        setEnrollments(Array.from(map.values()));
      } else {
        setEnrollments(localList);
      }
    } catch (err) {
      console.warn('Erro ao carregar matrículas:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEnrollments();

    function handleUpdate() {
      fetchEnrollments();
    }
    window.addEventListener('enrollments_updated', handleUpdate);
    return () => window.removeEventListener('enrollments_updated', handleUpdate);
  }, []);

  async function handleApprove(enr: Enrollment) {
    if (!confirm(`Deseja aprovar a matrícula de ${enr.student_name}?`)) return;
    setActionLoading(enr.id);
    try {
      // Atualiza localmente
      const updated = enrollments.map((item) =>
        item.id === enr.id ? { ...item, status: 'approved' as const } : item
      );
      setEnrollments(updated);
      localStorage.setItem('escola_saas_enrollments', JSON.stringify(updated));

      // Atualiza no Supabase
      await supabase
        .from('enrollments')
        .update({ status: 'approved' })
        .eq('id', enr.id);

      // Cria registro do aluno
      await supabase.from('students').insert({
        school_id: enr.school_id,
        full_name: enr.student_name,
        date_of_birth: enr.student_dob,
        emergency_contact_name: enr.parent_name,
        emergency_contact_phone: enr.parent_phone,
      });

      alert(`Matrícula de ${enr.student_name} aprovada com sucesso! O cadastro foi atualizado.`);
    } catch (err) {
      console.warn('Aviso ao sincronizar aprovação com banco:', err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(enr: Enrollment) {
    const reason = prompt(`Motivo da recusa para ${enr.student_name}:`, 'Vagas esgotadas para a turma desta faixa etária');
    if (reason === null) return;
    setActionLoading(enr.id);
    try {
      // Atualiza localmente
      const updated = enrollments.map((item) =>
        item.id === enr.id
          ? { ...item, status: 'rejected' as const, rejection_reason: reason }
          : item
      );
      setEnrollments(updated);
      localStorage.setItem('escola_saas_enrollments', JSON.stringify(updated));

      // Atualiza no Supabase
      await supabase
        .from('enrollments')
        .update({ status: 'rejected', rejection_reason: reason })
        .eq('id', enr.id);
    } catch (err) {
      console.warn('Aviso ao sincronizar recusa com banco:', err);
    } finally {
      setActionLoading(null);
    }
  }

  const filteredEnrollments = enrollments.filter((enr) => {
    const matchSearch =
      enr.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enr.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (enr.parent_phone && enr.parent_phone.includes(searchTerm));
    const matchStatus = statusFilter === 'all' || enr.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gerenciamento de Matrículas</h1>
          <p className="text-muted-foreground">
            Visualize solicitações, aprove, recuse e imprima ou salve fichas oficiais em PDF.
          </p>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por aluno, responsável ou telefone..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-card text-sm outline-none focus:border-primary shadow-xs"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary shadow-xs"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovadas</option>
            <option value="rejected">Recusadas</option>
          </select>
        </div>
      </div>

      {/* Tabela de Matrículas */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando matrículas...</div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-base font-semibold text-foreground">Nenhuma matrícula encontrada</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm || statusFilter !== 'all'
                ? 'Nenhum registro corresponde aos filtros selecionados.'
                : 'As solicitações de matrícula enviadas pelo site aparecerão aqui.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Aluno</th>
                  <th className="px-6 py-3">Responsável</th>
                  <th className="px-6 py-3">Contato</th>
                  <th className="px-6 py-3">Tipo</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3 text-right">Ficha PDF & Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEnrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {enr.student_name}
                      {enr.medical_info && (
                        <span className="block text-[11px] text-amber-600 dark:text-amber-400 font-normal truncate max-w-xs" title={enr.medical_info}>
                          Obs: {enr.medical_info}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{enr.parent_name}</td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{enr.parent_phone}</td>
                    <td className="px-6 py-4 capitalize text-xs font-medium">{enr.type}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          enr.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : enr.status === 'rejected'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}
                      >
                        {enr.status === 'approved' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : enr.status === 'rejected' ? (
                          <XCircle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {enr.status === 'approved'
                          ? 'Aprovada'
                          : enr.status === 'rejected'
                          ? 'Recusada'
                          : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(enr.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Botão de Abrir e Imprimir PDF Oficial */}
                        <button
                          onClick={() => setSelectedForPrint(enr)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted hover:border-primary/40 transition-colors shadow-2xs cursor-pointer"
                          title="Visualizar Ficha Oficial de Matrícula e Imprimir/Salvar em PDF"
                        >
                          <Printer className="h-3.5 w-3.5 text-primary" />
                          <span>Ficha PDF</span>
                        </button>

                        {/* Ações de Aprovar / Recusar caso pendente */}
                        {enr.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(enr)}
                              disabled={actionLoading === enr.id}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                              title="Aprovar Matrícula e Cadastrar Aluno"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Aprovar
                            </button>
                            <button
                              onClick={() => handleReject(enr)}
                              disabled={actionLoading === enr.id}
                              className="inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50 cursor-pointer"
                              title="Recusar Matrícula"
                            >
                              <X className="h-3.5 w-3.5" />
                              Recusar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Impressão de PDF da Matrícula */}
      {selectedForPrint && (
        <EnrollmentPrintModal
          enrollment={selectedForPrint}
          onClose={() => setSelectedForPrint(null)}
        />
      )}
    </div>
  );
}

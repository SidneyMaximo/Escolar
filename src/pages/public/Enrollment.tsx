import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Upload, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { Enrollment } from '@/types/database';
import { EnrollmentPrintModal } from '@/components/enrollment/EnrollmentPrintModal';

const STEPS = ['Dados do Aluno', 'Dados do Responsável', 'Documentos', 'Revisão'];

export function Enrollment() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submittedEnrollment, setSubmittedEnrollment] = useState<Enrollment | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [formData, setFormData] = useState({
    student_name: '',
    student_dob: '',
    gender: 'M',
    previous_school: '',
    medical_info: '',
    parent_name: '',
    parent_cpf: '',
    parent_phone: '',
    parent_email: '',
    address: '',
    agree_terms: true,
  });

  function handleChange(field: string, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!formData.student_name || !formData.parent_name || !formData.parent_phone) {
      alert('Por favor, preencha os dados obrigatórios do aluno e do responsável.');
      return;
    }

    setSubmitting(true);
    const newId = crypto.randomUUID();
    const newEnrollment: Enrollment = {
      id: newId,
      school_id: '00000000-0000-0000-0000-000000000001',
      type: 'matricula',
      student_name: formData.student_name,
      student_dob: formData.student_dob || '2020-01-01',
      parent_name: formData.parent_name,
      parent_email: formData.parent_email || '',
      parent_phone: formData.parent_phone,
      parent_cpf: formData.parent_cpf || null,
      address: { full: formData.address },
      previous_school: formData.previous_school || null,
      medical_info: formData.medical_info || null,
      documents: {},
      status: 'pending',
      reviewed_by: null,
      reviewed_at: null,
      rejection_reason: null,
      created_at: new Date().toISOString(),
    };

    // 1. Salva localmente para demo imediata
    try {
      const existingRaw = localStorage.getItem('escola_saas_enrollments');
      const list: Enrollment[] = existingRaw ? JSON.parse(existingRaw) : [];
      list.unshift(newEnrollment);
      localStorage.setItem('escola_saas_enrollments', JSON.stringify(list));
      window.dispatchEvent(new Event('enrollments_updated'));
    } catch (e) {
      console.warn('Erro ao salvar matrícula localmente:', e);
    }

    // 2. Tenta sincronizar com Supabase se a tabela existir
    try {
      await supabase.from('enrollments').insert({
        id: newEnrollment.id,
        school_id: newEnrollment.school_id,
        type: newEnrollment.type,
        student_name: newEnrollment.student_name,
        student_dob: newEnrollment.student_dob,
        parent_name: newEnrollment.parent_name,
        parent_email: newEnrollment.parent_email,
        parent_phone: newEnrollment.parent_phone,
        parent_cpf: newEnrollment.parent_cpf,
        address: newEnrollment.address,
        previous_school: newEnrollment.previous_school,
        medical_info: newEnrollment.medical_info,
        status: newEnrollment.status,
      });
    } catch (err) {
      console.warn('Supabase enrollments sync pendente:', err);
    }

    setSubmitting(false);
    setSubmittedEnrollment(newEnrollment);
  }

  // TELA DE SUCESSO APÓS SUBMISSÃO
  if (submittedEnrollment) {
    const protocol = `MAT-${submittedEnrollment.id.slice(0, 8).toUpperCase()}`;

    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 border-2 border-emerald-500/20 shadow-md">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-mono font-bold text-primary mb-3">
          Protocolo: {protocol}
        </span>

        <h1 className="text-3xl font-extrabold text-foreground">Solicitação de Matrícula Enviada!</h1>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          Os dados de <strong>{submittedEnrollment.student_name}</strong> foram recebidos com sucesso.
          Nossa secretaria analisará a documentação e entrará em contato pelo telefone{' '}
          <strong>{submittedEnrollment.parent_phone}</strong>.
        </p>

        {/* Card de Ficha PDF para Impressão */}
        <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-left shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">Ficha de Requerimento de Matrícula</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Você pode salvar ou imprimir uma via oficial da sua ficha de requerimento de matrícula em formato PDF agora mesmo:
          </p>
          <button
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            Baixar / Imprimir Ficha (PDF)
          </button>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Voltar à Página Inicial
          </a>
        </div>

        {showPrintModal && (
          <EnrollmentPrintModal
            enrollment={submittedEnrollment}
            onClose={() => setShowPrintModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Matrícula Online</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Preencha o formulário abaixo para iniciar o processo de matrícula
        </p>
      </div>

      {/* Indicador de Passos */}
      <div className="mt-12 mb-8 flex items-center justify-between">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors',
                i <= step
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {i + 1}
            </div>
            <span
              className={cn(
                'hidden text-sm font-medium sm:block',
                i <= step ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'hidden h-px w-8 sm:block lg:w-16',
                  i < step ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        {/* Passo 0: Dados do Aluno */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">1. Dados do Aluno</h2>
            <div>
              <label className="block text-sm font-medium text-foreground">Nome completo da criança *</label>
              <input
                type="text"
                required
                value={formData.student_name}
                onChange={(e) => handleChange('student_name', e.target.value)}
                placeholder="Ex: Pedro Henrique da Silva"
                className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20 font-medium"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">Data de nascimento *</label>
                <input
                  type="date"
                  required
                  value={formData.student_dob}
                  onChange={(e) => handleChange('student_dob', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Gênero</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="NB">Não-binário</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Escola anterior (se houver)</label>
              <input
                type="text"
                value={formData.previous_school}
                onChange={(e) => handleChange('previous_school', e.target.value)}
                placeholder="Ex: Creche Municipal Estrelinha ou Nenhuma"
                className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Observações médicas / Alergias / Restrições alimentares</label>
              <textarea
                rows={3}
                value={formData.medical_info}
                onChange={(e) => handleChange('medical_info', e.target.value)}
                placeholder="Ex: Alergia a lactose, intolerância a glúten, rinite..."
                className="mt-1 w-full resize-none rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>
        )}

        {/* Passo 1: Dados do Responsável */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">2. Dados do Responsável</h2>
            <div>
              <label className="block text-sm font-medium text-foreground">Nome completo do responsável *</label>
              <input
                type="text"
                required
                value={formData.parent_name}
                onChange={(e) => handleChange('parent_name', e.target.value)}
                placeholder="Ex: Mariana Costa da Silva"
                className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20 font-medium"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">CPF do responsável</label>
                <input
                  type="text"
                  value={formData.parent_cpf}
                  onChange={(e) => handleChange('parent_cpf', e.target.value)}
                  placeholder="000.000.000-00"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Telefone / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={formData.parent_phone}
                  onChange={(e) => handleChange('parent_phone', e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20 font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">E-mail</label>
              <input
                type="email"
                value={formData.parent_email}
                onChange={(e) => handleChange('parent_email', e.target.value)}
                placeholder="mariana@exemplo.com"
                className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Endereço completo (Rua, Número, Bairro e Cidade)</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Ex: Rua das Palmeiras, 150 - Apto 32 - São Paulo, SP"
                className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>
        )}

        {/* Passo 2: Documentos */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">3. Documentos Solicitados</h2>
            <p className="text-sm text-muted-foreground">
              Documentos que serão anexados à ficha física e digital da criança:
            </p>
            {[
              'Certidão de nascimento da criança',
              'RG e CPF do responsável legal',
              'Comprovante de residência atualizado',
              'Cartão de vacinação em dia',
              'Foto 3x4 da criança',
            ].map((doc) => (
              <div key={doc} className="flex items-center gap-4 rounded-xl border border-dashed border-border p-4 bg-muted/20">
                <Upload className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{doc}</p>
                  <p className="text-[11px] text-muted-foreground">Formatos suportados: PDF, JPG ou PNG</p>
                </div>
                <label className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 cursor-pointer">
                  Selecionar
                  <input type="file" className="hidden" />
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Passo 3: Revisão */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-foreground">4. Revisão Geral dos Dados</h2>
            <p className="text-sm text-muted-foreground">
              Verifique todos os dados antes de submeter. A ficha oficial de matrícula poderá ser impressa ou salva em PDF logo após o envio.
            </p>

            <div className="rounded-xl border border-border bg-muted/40 p-6 space-y-2 text-sm">
              <p><strong>Criança:</strong> {formData.student_name || 'Não preenchido'}</p>
              <p><strong>Nascimento:</strong> {formData.student_dob || 'Não informado'}</p>
              <p><strong>Responsável:</strong> {formData.parent_name || 'Não preenchido'}</p>
              <p><strong>Telefone:</strong> {formData.parent_phone || 'Não preenchido'}</p>
              <p><strong>E-mail:</strong> {formData.parent_email || 'Não informado'}</p>
              <p><strong>Endereço:</strong> {formData.address || 'Não informado'}</p>
              {formData.medical_info && (
                <p className="text-amber-700 dark:text-amber-400"><strong>Observações Médicas:</strong> {formData.medical_info}</p>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agree_terms}
                onChange={(e) => handleChange('agree_terms', e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-input accent-primary"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                Declaro que as informações fornecidas são a expressão da verdade e autorizo o tratamento dos dados pessoais da criança conforme a Lei Geral de Proteção de Dados (LGPD).
              </span>
            </label>
          </div>
        )}

        {/* Botões de Navegação */}
        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <button
            type="button"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 0 && !formData.student_name) {
                  alert('Por favor, digite o nome completo da criança.');
                  return;
                }
                if (step === 1 && (!formData.parent_name || !formData.parent_phone)) {
                  alert('Por favor, informe o nome e telefone do responsável.');
                  return;
                }
                setStep(step + 1);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Próximo
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting || !formData.agree_terms}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-2.5 text-sm font-semibold text-secondary-foreground hover:bg-secondary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Gravando Matrícula...' : 'Finalizar e Gerar Ficha'}
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
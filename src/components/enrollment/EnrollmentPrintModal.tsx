import { useEffect } from 'react';
import { Printer, X, Download, ShieldCheck, CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';
import type { Enrollment } from '@/types/database';
import { useSiteContent } from '@/lib/siteContent';

interface EnrollmentPrintModalProps {
  enrollment: Enrollment;
  onClose: () => void;
}

export function EnrollmentPrintModal({ enrollment, onClose }: EnrollmentPrintModalProps) {
  const content = useSiteContent();
  const school = content.school;

  // Fecha com ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handlePrint() {
    window.print();
  }

  const protocol = `MAT-${(enrollment.id || '2026').slice(0, 8).toUpperCase()}`;
  const formattedDob = enrollment.student_dob
    ? new Date(enrollment.student_dob + 'T12:00:00').toLocaleDateString('pt-BR')
    : 'Não informada';
  const formattedDate = enrollment.created_at
    ? new Date(enrollment.created_at).toLocaleDateString('pt-BR')
    : new Date().toLocaleDateString('pt-BR');

  const addressText = typeof enrollment.address === 'string'
    ? enrollment.address
    : enrollment.address && typeof enrollment.address === 'object'
    ? Object.values(enrollment.address).filter(Boolean).join(', ')
    : 'Não informado';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      {/* Container Principal */}
      <div className="relative w-full max-w-4xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden my-8 print:my-0 print:border-none print:shadow-none print:w-full">
        {/* Barra de Ações Superior (Oculta na Impressão) */}
        <div className="no-print flex items-center justify-between border-b border-border bg-muted/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Ficha de Matrícula (PDF / Impressão)</h2>
              <p className="text-xs text-muted-foreground font-mono">Protocolo: {protocol}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              Imprimir / Salvar PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title="Fechar (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* ZONA DE IMPRESSÃO (FICHA OFICIAL A4)                      */}
        {/* ======================================================== */}
        <div id="enrollment-print-zone" className="p-8 sm:p-12 bg-white text-gray-900 font-sans print:p-0">
          {/* Cabeçalho da Escola */}
          <div className="border-b-2 border-gray-800 pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-gray-950 uppercase">
                  {school.name}
                </h1>
                <p className="text-xs text-gray-600 mt-0.5 font-medium">
                  Educação Infantil & Desenvolvimento Integral • CNPJ: {school.cnpj || '12.345.678/0001-90'}
                </p>
                <p className="text-xs text-gray-600">
                  {school.address} {school.neighborhoodCity ? `- ${school.neighborhoodCity}` : ''} {school.cep ? `(CEP ${school.cep})` : ''}
                </p>
                <p className="text-xs text-gray-600">
                  Tel: {school.phone} {school.phoneSecondary ? `• Cel/WhatsApp: ${school.phoneSecondary}` : ''} • E-mail: {school.email}
                </p>
              </div>

              {/* Protocolo e Data */}
              <div className="text-right border border-gray-300 rounded-lg p-3 bg-gray-50 min-w-[170px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Protocolo</span>
                <span className="text-sm font-mono font-black text-gray-900 block">{protocol}</span>
                <span className="text-[10px] text-gray-500 block mt-1">Data: {formattedDate}</span>
                <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded uppercase border text-gray-800 bg-white">
                  {enrollment.status === 'approved' ? '✓ Aprovada' : enrollment.status === 'rejected' ? '✗ Recusada' : '⏳ Pendente'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-dashed border-gray-300 text-center">
              <h2 className="text-base font-extrabold tracking-wide uppercase text-gray-900">
                REQUERIMENTO OFICIAL DE MATRÍCULA ESCOLAR — ANO LETIVO 2026
              </h2>
            </div>
          </div>

          {/* QUADRO 1: DADOS DO ALUNO */}
          <div className="mb-6">
            <div className="bg-gray-100 border border-gray-300 px-3 py-1.5 font-bold text-xs uppercase tracking-wider text-gray-800 mb-2">
              1. Identificação da Criança / Aluno(a)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border border-gray-200 p-3 rounded-md bg-gray-50/50">
              <div className="col-span-2">
                <span className="text-gray-500 block font-semibold text-[10px] uppercase">Nome Completo do Aluno</span>
                <span className="font-bold text-gray-950 text-sm">{enrollment.student_name}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-semibold text-[10px] uppercase">Data de Nascimento</span>
                <span className="font-medium text-gray-900">{formattedDob}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-semibold text-[10px] uppercase">Tipo de Matrícula</span>
                <span className="font-medium text-gray-900 capitalize">{enrollment.type || 'Matrícula Inicial'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 block font-semibold text-[10px] uppercase">Escola Anterior de Origem</span>
                <span className="font-medium text-gray-900">{enrollment.previous_school || 'Primeira matrícula na rede escolar'}</span>
              </div>
              <div className="col-span-3 pt-1 border-t border-gray-200">
                <span className="text-gray-500 block font-semibold text-[10px] uppercase">Observações de Saúde / Alergias / Medicamentos</span>
                <span className="font-medium text-gray-800 italic">
                  {enrollment.medical_info || 'Nenhuma restrição médica ou alimentar declarada pelo responsável.'}
                </span>
              </div>
            </div>
          </div>

          {/* QUADRO 2: DADOS DO RESPONSÁVEL LEGAL */}
          <div className="mb-6">
            <div className="bg-gray-100 border border-gray-300 px-3 py-1.5 font-bold text-xs uppercase tracking-wider text-gray-800 mb-2">
              2. Dados do Responsável Legal / Financeiro
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border border-gray-200 p-3 rounded-md bg-gray-50/50">
              <div className="col-span-2">
                <span className="text-gray-500 block font-semibold text-[10px] uppercase">Nome do Responsável</span>
                <span className="font-bold text-gray-950 text-sm">{enrollment.parent_name}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-semibold text-[10px] uppercase">CPF</span>
                <span className="font-medium text-gray-900">{enrollment.parent_cpf || 'Não informado'}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-semibold text-[10px] uppercase">Telefone / WhatsApp</span>
                <span className="font-medium text-gray-900">{enrollment.parent_phone}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 block font-semibold text-[10px] uppercase">E-mail para Contato</span>
                <span className="font-medium text-gray-900">{enrollment.parent_email || 'Não informado'}</span>
              </div>
              <div className="col-span-3 pt-1 border-t border-gray-200">
                <span className="text-gray-500 block font-semibold text-[10px] uppercase">Endereço Residencial Completo</span>
                <span className="font-medium text-gray-900">{addressText}</span>
              </div>
            </div>
          </div>

          {/* QUADRO 3: TERMO DE COMPROMISSO E LGPD */}
          <div className="mb-6">
            <div className="bg-gray-100 border border-gray-300 px-3 py-1.5 font-bold text-xs uppercase tracking-wider text-gray-800 mb-2">
              3. Termo de Ciência e Conformidade LGPD
            </div>
            <div className="text-[11px] text-gray-700 leading-relaxed border border-gray-200 p-3 rounded-md bg-white text-justify">
              <p>
                Declaro para os devidos fins que todas as informações acima descritas são expressão da verdade e requeiro formalmente
                a matrícula do(a) aluno(a) supracitado(a) na <strong>{school.name}</strong> para o período letivo correspondente.
                Autorizo a instituição escolar a tratar os dados pessoais e sensíveis da criança exclusivamente para fins pedagógicos,
                administrativos e de cuidados de saúde escolar, em conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)</strong>.
              </p>
            </div>
          </div>

          {/* QUADRO 4: PARECER DA SECRETARIA & ASSINATURAS */}
          <div className="mt-8 pt-4 border-t border-gray-300">
            <div className="grid grid-cols-2 gap-8 text-center pt-6">
              {/* Assinatura do Responsável */}
              <div className="flex flex-col justify-end items-center">
                <div className="w-64 border-b border-gray-800 mb-1" />
                <span className="text-xs font-bold text-gray-900">{enrollment.parent_name}</span>
                <span className="text-[10px] text-gray-500 uppercase">Assinatura do Responsável Legal</span>
                <span className="text-[10px] text-gray-400 mt-1">Data: ____/____/2026</span>
              </div>

              {/* Assinatura e Carimbo da Direção */}
              <div className="flex flex-col justify-end items-center">
                <div className="w-64 border-b border-gray-800 mb-1" />
                <span className="text-xs font-bold text-gray-900">Direção / Secretaria Pedagógica</span>
                <span className="text-[10px] text-gray-500 uppercase">Visto & Carimbo da Instituição</span>
                <span className="text-[10px] text-gray-400 mt-1">{school.name}</span>
              </div>
            </div>
          </div>

          {/* Rodapé Oficial da Ficha */}
          <div className="mt-10 pt-3 border-t border-dashed border-gray-300 flex justify-between items-center text-[9px] text-gray-400 font-mono">
            <span>Sistema de Gestão Escolar SaaS • Documento com validade para arquivo escolar</span>
            <span>Emitido em: {new Date().toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = ['Dados do Aluno', 'Dados do Responsável', 'Documentos', 'Revisão'];

export function Enrollment() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-32 text-center sm:px-6">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Pré-matrícula Enviada!</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Recebemos seus dados com sucesso. Nossa equipe entrará em contato em até 48 horas
          para confirmar a matrícula e agendar a visita.
        </p>
        <a
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Voltar ao Início
        </a>
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

      {/* Step indicator */}
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
        {/* Step 0: Student data */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Dados do Aluno</h2>
            <div>
              <label className="block text-sm font-medium text-foreground">Nome completo da criança</label>
              <input type="text" className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">Data de nascimento</label>
                <input type="date" className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Gênero</label>
                <select className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20">
                  <option value="">Selecione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="NB">Não-binário</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Escola anterior (se houver)</label>
              <input type="text" className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Observações médicas / alergias</label>
              <textarea rows={3} className="mt-1 w-full resize-none rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
            </div>
          </div>
        )}

        {/* Step 1: Parent data */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Dados do Responsável</h2>
            <div>
              <label className="block text-sm font-medium text-foreground">Nome completo</label>
              <input type="text" className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">CPF</label>
                <input type="text" placeholder="000.000.000-00" className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Telefone</label>
                <input type="tel" placeholder="(11) 99999-9999" className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">E-mail</label>
              <input type="email" className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Endereço completo</label>
              <input type="text" className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" />
            </div>
          </div>
        )}

        {/* Step 2: Documents */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Documentos Necessários</h2>
            <p className="text-sm text-muted-foreground">
              Faça upload dos documentos listados abaixo. Formatos aceitos: PDF, JPG, PNG.
            </p>
            {[
              'Certidão de nascimento da criança',
              'RG e CPF do responsável',
              'Comprovante de residência',
              'Cartão de vacinação atualizado',
              'Foto 3x4 da criança',
            ].map((doc) => (
              <div key={doc} className="flex items-center gap-4 rounded-xl border border-dashed border-border p-4">
                <Upload className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{doc}</p>
                </div>
                <button type="button" className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                  Selecionar arquivo
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Revisão dos Dados</h2>
            <p className="text-sm text-muted-foreground">
              Revise as informações antes de enviar. Após o envio, nossa equipe entrará em contato.
            </p>
            <div className="rounded-xl bg-muted/50 p-6 space-y-3">
              <p className="text-sm"><strong>Aluno:</strong> Nome da criança</p>
              <p className="text-sm"><strong>Nascimento:</strong> 01/01/2020</p>
              <p className="text-sm"><strong>Responsável:</strong> Nome do responsável</p>
              <p className="text-sm"><strong>E-mail:</strong> email@exemplo.com</p>
              <p className="text-sm"><strong>Telefone:</strong> (11) 99999-9999</p>
            </div>
            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded border-input accent-primary" />
              <span className="text-sm text-muted-foreground">
                Declaro que as informações fornecidas são verdadeiras e autorizo o tratamento dos dados conforme a LGPD.
              </span>
            </label>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Próximo
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => setSubmitted(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-2.5 text-sm font-semibold text-secondary-foreground hover:bg-secondary/90"
            >
              Enviar Matrícula
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
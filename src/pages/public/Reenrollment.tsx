import { useState } from 'react';
import { Check, Upload } from 'lucide-react';

export function Reenrollment() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-32 text-center sm:px-6">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Rematrícula Enviada!</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Recebemos sua solicitação de rematrícula. Nossa equipe entrará em contato
          para confirmar os dados e emitir o boleto.
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
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Rematrícula Online</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Renove a matrícula do seu filho para o próximo ano letivo
        </p>
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Dados do Aluno</h2>
          <div>
            <label className="block text-sm font-medium text-foreground">Nome completo da criança</label>
            <input type="text" className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" placeholder="Nome como consta na matrícula atual" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground">Ano de nascimento</label>
              <input type="number" min="2010" max="2025" className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20" placeholder="2020" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Turma atual</label>
              <select className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20">
                <option value="">Selecione</option>
                <option value="bercario">Berçário</option>
                <option value="maternal1">Maternal I</option>
                <option value="maternal2">Maternal II</option>
                <option value="jardim1">Jardim I</option>
                <option value="jardim2">Jardim II</option>
                <option value="fund1">1º Ano Fundamental</option>
                <option value="fund2">2º Ano Fundamental</option>
                <option value="fund3">3º Ano Fundamental</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
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
        </div>

        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Atualização de Documentos</h2>
          <p className="text-sm text-muted-foreground">
            Se houver mudança de endereço ou novos documentos médicos, faça upload abaixo.
          </p>
          <div className="flex items-center gap-4 rounded-xl border border-dashed border-border p-4">
            <Upload className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Comprovante de residência atualizado</p>
            </div>
            <button type="button" className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
              Selecionar arquivo
            </button>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-input accent-primary" />
            <span className="text-sm text-muted-foreground">
              Confirmo que desejo renovar a matrícula e autorizo o tratamento dos dados conforme a LGPD.
            </span>
          </label>
          <button
            onClick={() => setSubmitted(true)}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground hover:bg-secondary/90 sm:w-auto"
          >
            Enviar Rematrícula
            <Check className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { useSiteContent } from '@/lib/siteContent';

export function Contact() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const content = useSiteContent();
  const school = content.school;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState('submitting');
    // TODO: integrate with Supabase or email service
    await new Promise((r) => setTimeout(r, 1000));
    setFormState('success');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Fale Conosco</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Estamos prontos para atender você e sua família
        </p>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        {/* Contact info */}
        <div className="space-y-8">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">Informações de Contato</h2>
            <div className="mt-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Telefone</p>
                  {school.phone && (
                    <a href={`tel:${school.phone.replace(/\D/g, '')}`} className="block text-muted-foreground hover:text-primary transition-colors">
                      {school.phone}
                    </a>
                  )}
                  {school.phoneSecondary && (
                    <a href={`tel:${school.phoneSecondary.replace(/\D/g, '')}`} className="block text-muted-foreground hover:text-primary transition-colors">
                      {school.phoneSecondary}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">E-mail</p>
                  {school.email && (
                    <a href={`mailto:${school.email}`} className="block text-muted-foreground hover:text-primary transition-colors">
                      {school.email}
                    </a>
                  )}
                  {school.emailSecondary && (
                    <a href={`mailto:${school.emailSecondary}`} className="block text-muted-foreground hover:text-primary transition-colors">
                      {school.emailSecondary}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Endereço</p>
                  <p className="text-muted-foreground">{school.address || 'Consulte nosso endereço'}</p>
                  {school.neighborhoodCity && (
                    <p className="text-muted-foreground">{school.neighborhoodCity}</p>
                  )}
                  {school.cep && (
                    <p className="text-muted-foreground">CEP: {school.cep}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Horário de Atendimento</p>
                  <p className="text-muted-foreground">{school.openingHoursWeekdays || 'Segunda a Sexta: 7h às 18h'}</p>
                  <p className="text-muted-foreground">{school.openingHoursSaturday || 'Sábado: 8h às 12h'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-secondary/5 p-8">
            <h3 className="font-semibold text-foreground">Agende uma Visita</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Venha conhecer nossa estrutura e metodologia. Agende uma visita guiada
              sem compromisso e tire todas as suas dúvidas pessoalmente.
            </p>
          </div>
        </div>

        {/* Contact form */}
        <div className="rounded-2xl border border-border bg-card p-8">
          <h2 className="text-xl font-semibold text-foreground">Envie uma Mensagem</h2>
          {formState === 'success' ? (
            <div className="mt-8 rounded-xl bg-primary/10 p-6 text-center">
              <p className="font-medium text-primary">Mensagem enviada com sucesso!</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Entraremos em contato em até 24 horas úteis.
              </p>
              <button
                onClick={() => setFormState('idle')}
                className="mt-4 text-sm font-medium text-primary hover:underline"
              >
                Enviar nova mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground">
                  Nome completo
                </label>
                <input
                  id="name"
                  required
                  type="text"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none ring-ring focus:border-primary focus:ring-2 focus:ring-ring/20"
                  placeholder="Seu nome"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    E-mail
                  </label>
                  <input
                    id="email"
                    required
                    type="email"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none ring-ring focus:border-primary focus:ring-2 focus:ring-ring/20"
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                    Telefone
                  </label>
                  <input
                    id="phone"
                    required
                    type="tel"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none ring-ring focus:border-primary focus:ring-2 focus:ring-ring/20"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-foreground">
                  Assunto
                </label>
                <select
                  id="subject"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none ring-ring focus:border-primary focus:ring-2 focus:ring-ring/20"
                >
                  <option value="">Selecione o assunto</option>
                  <option value="matricula">Informações sobre matrícula</option>
                  <option value="visita">Agendar visita</option>
                  <option value="pedagogico">Dúvidas pedagógicas</option>
                  <option value="financeiro">Questões financeiras</option>
                  <option value="outro">Outro assunto</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  className="mt-1 w-full resize-none rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none ring-ring focus:border-primary focus:ring-2 focus:ring-ring/20"
                  placeholder="Como podemos ajudar?"
                />
              </div>
              <button
                type="submit"
                disabled={formState === 'submitting'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {formState === 'submitting' ? 'Enviando...' : 'Enviar Mensagem'}
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
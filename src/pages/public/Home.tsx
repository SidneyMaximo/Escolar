import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Heart, Shield, Star } from 'lucide-react';
import { useSiteContent } from '@/lib/siteContent';

export function Home() {
  const content = useSiteContent();
  const hero = content.hero;

  return (
    <div>
      {/* Hero */}
      <section
        className="relative flex min-h-[700px] items-center bg-cover bg-center-bottom bg-no-repeat transition-all"
        style={{ backgroundImage: `url("${hero.bgImage}")` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/40 to-transparent" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            {hero.badge && (
              <span className="inline-block rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-white shadow-sm">
                {hero.badge}
              </span>
            )}
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {hero.title}
            </h1>
            <p className="mt-6 text-base text-muted-foreground sm:text-lg">
              {hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/matricula"
                className="inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-secondary/90 transition-colors"
              >
                {hero.ctaPrimaryText || 'Matricule-se Agora'}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/sobre"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/90 px-6 py-3 text-base font-semibold text-foreground backdrop-blur-sm hover:bg-card transition-colors"
              >
                {hero.ctaSecondaryText || 'Conheça a Escola'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Heart, title: 'Acolhimento', desc: 'Ambiente seguro e afetivo onde cada criança se sente valorizada.' },
            { icon: BookOpen, title: 'Metodologia Ativa', desc: 'Aprendizado através de experiências, projetos e brincadeiras.' },
            { icon: Shield, title: 'Segurança Total', desc: 'Monitoramento 24h, controle de acesso e equipe preparada.' },
            { icon: Star, title: 'Excelência', desc: 'Professores qualificados e currículo alinhado à BNCC.' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
            Pronto para fazer parte da nossa família?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Agende uma visita ou inicie o processo de matrícula online agora mesmo.
          </p>
          <Link
            to="/contato"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-card px-8 py-3 text-base font-semibold text-primary shadow-lg hover:bg-muted"
          >
            Fale Conosco
          </Link>
        </div>
      </section>
    </div>
  );
}
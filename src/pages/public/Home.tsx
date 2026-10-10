import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Heart, Shield, Star } from 'lucide-react';

export function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-20 lg:px-8">
          <div className="order-2 lg:order-1">
            <span className="inline-block rounded-full bg-secondary/90 px-4 py-1.5 text-sm font-medium text-white shadow-sm">
              Matrículas abertas 2026
            </span>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Educação com amor para o futuro do seu filho
            </h1>
            <p className="mt-6 text-base text-muted-foreground sm:text-lg">
              Na Escola Infantil, cada criança é única. Nossa metodologia combina aprendizado lúdico,
              desenvolvimento socioemocional e excelência acadêmica em um ambiente seguro e acolhedor.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/matricula"
                className="inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-secondary/90"
              >
                Matricule-se Agora
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/sobre"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-base font-semibold text-foreground hover:bg-muted"
              >
                Conheça a Escola
              </Link>
            </div>
          </div>
          <div className="order-1 flex items-center justify-center lg:order-2">
            <img
              src="/Aprender%20Tamb%C3%A9m%20%C3%89%20Ser%20Feliz!.png"
              alt="Crianças felizes na sala de aula — Aprender Também É Ser Feliz"
              className="h-auto w-full max-w-full object-contain rounded-2xl shadow-xl"
            />
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
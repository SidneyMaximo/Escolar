import { Puzzle, Music, Leaf, Users, Lightbulb, Palette } from 'lucide-react';

const METHODS = [
  { icon: Puzzle, title: 'Aprendizado Lúdico', desc: 'Jogos e brincadeiras como ferramentas pedagógicas para desenvolver raciocínio lógico e criatividade.' },
  { icon: Music, title: 'Artes e Música', desc: 'Expressão artística integrada ao currículo, estimulando sensibilidade e coordenação motora.' },
  { icon: Leaf, title: 'Natureza e Sustentabilidade', desc: 'Contato com a natureza através de horta escolar e atividades ao ar livre.' },
  { icon: Users, title: 'Socioemocional', desc: 'Desenvolvimento de habilidades como empatia, cooperação e autonomia desde cedo.' },
  { icon: Lightbulb, title: 'Projetos Investigativos', desc: 'Crianças como protagonistas do aprendizado, explorando temas de interesse coletivo.' },
  { icon: Palette, title: 'Multilinguagem', desc: 'Inglês introdutório, linguagem corporal, digital e artística integradas ao dia a dia.' },
];

export function Methodology() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Nossa Metodologia</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Combinamos as melhores práticas educacionais com carinho e atenção individual
          para garantir o desenvolvimento integral de cada criança.
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {METHODS.map((item) => (
          <div key={item.title} className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-md">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <item.icon className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
            <p className="mt-3 text-muted-foreground leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <section className="mt-20 rounded-3xl bg-primary/5 p-8 sm:p-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground">Alinhada à BNCC</h2>
          <p className="mt-4 text-muted-foreground">
            Nosso currículo segue integralmente a Base Nacional Comum Curricular,
            garantindo que todas as competências e habilidades essenciais sejam
            trabalhadas de forma contextualizada e significativa.
          </p>
        </div>
      </section>
    </div>
  );
}
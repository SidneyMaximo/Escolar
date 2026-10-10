import { Heart, Target, Eye } from 'lucide-react';

export function About() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Sobre Nossa Escola</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Há mais de 20 anos formando cidadãos conscientes e felizes
        </p>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Nossa História</h2>
          <p className="text-muted-foreground">
            Fundada em 2005, a Escola Infantil nasceu do sonho de criar um espaço educativo onde
            cada criança pudesse desenvolver seu potencial máximo. Ao longo dos anos, nos tornamos
            referência em educação infantil e ensino fundamental na região.
          </p>
          <p className="text-muted-foreground">
            Nossa equipe é formada por profissionais apaixonados pela educação, com formação
            continuada e especializações nas áreas de pedagogia, psicologia infantil e desenvolvimento cognitivo.
          </p>
        </div>
        <div className="rounded-2xl bg-primary/5 p-8">
          <div className="space-y-6">
            {[
              { icon: Heart, title: 'Missão', desc: 'Proporcionar educação de qualidade que promova o desenvolvimento integral da criança.' },
              { icon: Eye, title: 'Visão', desc: 'Ser referência em educação infantil, reconhecida pela excelência e inovação pedagógica.' },
              { icon: Target, title: 'Valores', desc: 'Respeito, responsabilidade, cooperação, solidariedade e compromisso com a aprendizagem.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
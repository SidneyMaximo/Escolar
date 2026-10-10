import { GraduationCap, Heart } from 'lucide-react';

const TEAM = [
  { name: 'Ana Silva', role: 'Diretora Pedagógica', bio: 'Pedagoga com 15 anos de experiência em educação infantil.' },
  { name: 'Carlos Santos', role: 'Coordenador Acadêmico', bio: 'Mestre em Educação, especialista em currículo BNCC.' },
  { name: 'Maria Oliveira', role: 'Professora Regente', bio: 'Licenciada em Pedagogia, apaixonada por alfabetização.' },
  { name: 'João Pereira', role: 'Professor de Artes', bio: 'Artista plástico e educador, estimula criatividade.' },
  { name: 'Fernanda Lima', role: 'Psicóloga Escolar', bio: 'Especialista em desenvolvimento infantil e socioemocional.' },
  { name: 'Roberto Alves', role: 'Professor de Educação Física', bio: 'Foca em psicomotricidade e atividades lúdicas.' },
];

export function Team() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Nossa Equipe</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Profissionais dedicados e qualificados para cuidar do que mais importa
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {TEAM.map((member) => (
          <div key={member.name} className="group rounded-2xl border border-border bg-card p-6 text-center transition-all hover:border-primary/30 hover:shadow-md">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <GraduationCap className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
            <p className="text-sm font-medium text-secondary">{member.role}</p>
            <p className="mt-3 text-sm text-muted-foreground">{member.bio}</p>
          </div>
        ))}
      </div>

      <section className="mt-20 rounded-3xl bg-secondary/5 p-8 text-center sm:p-12">
        <Heart className="mx-auto h-10 w-10 text-secondary" />
        <h2 className="mt-4 text-2xl font-bold text-foreground">Formação Continuada</h2>
        <p className="mt-4 mx-auto max-w-2xl text-muted-foreground">
          Nossa equipe participa regularmente de cursos, workshops e seminários
          para garantir as melhores práticas educacionais atualizadas.
        </p>
      </section>
    </div>
  );
}
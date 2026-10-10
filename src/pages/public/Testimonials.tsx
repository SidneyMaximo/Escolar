import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Mariana Costa',
    role: 'Mãe do Pedro, 5 anos',
    text: 'Meu filho adora ir à escola! A equipe é super atenciosa e o desenvolvimento dele foi incrível nesse último ano.',
    rating: 5,
  },
  {
    name: 'Roberto Mendes',
    role: 'Pai da Sofia, 4 anos',
    text: 'A metodologia lúdica fez toda a diferença. A Sofia aprendeu a ler brincando e hoje é apaixonada por livros.',
    rating: 5,
  },
  {
    name: 'Patrícia Alves',
    role: 'Mãe do Lucas, 6 anos',
    text: 'O acompanhamento pedagógico é excelente. Recebemos feedback constante e sentimos que nosso filho é realmente especial para a escola.',
    rating: 5,
  },
  {
    name: 'Fernando Rocha',
    role: 'Pai da Beatriz, 3 anos',
    text: 'A adaptação foi tranquila graças ao acolhimento da equipe. Recomendo de olhos fechados para qualquer família.',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Depoimentos</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          O que as famílias dizem sobre nossa escola
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2">
        {TESTIMONIALS.map((item) => (
          <div
            key={item.name}
            className="rounded-2xl border border-border bg-card p-8 shadow-sm"
          >
            <div className="mb-4 flex gap-1">
              {Array.from({ length: item.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 fill-secondary text-secondary"
                />
              ))}
            </div>
            <blockquote className="text-lg italic text-foreground">
              "{item.text}"
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {item.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
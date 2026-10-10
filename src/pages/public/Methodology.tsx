import { Puzzle, Sparkles } from 'lucide-react';
import { useSiteContent } from '@/lib/siteContent';

export function Methodology() {
  const content = useSiteContent();
  const methodology = content.methodology;

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">{methodology.title}</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          {methodology.subtitle}
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {methodology.items.map((item, idx) => (
          <div key={idx} className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-md">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Puzzle className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
            <p className="mt-3 text-muted-foreground leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {methodology.bnccText && (
        <section className="mt-20 rounded-3xl bg-primary/5 p-8 sm:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground">Alinhada à BNCC</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {methodology.bnccText}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
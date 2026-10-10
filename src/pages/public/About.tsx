import { Heart, Target, Eye } from 'lucide-react';
import { useSiteContent } from '@/lib/siteContent';

export function About() {
  const content = useSiteContent();
  const about = content.about;

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">{about.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{about.subtitle}</p>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Nossa História</h2>
          <p className="text-muted-foreground leading-relaxed">
            {about.historyParagraph1}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {about.historyParagraph2}
          </p>
        </div>
        <div className="rounded-2xl bg-primary/5 p-8">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Missão</h3>
                <p className="mt-1 text-sm text-muted-foreground">{about.mission}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Visão</h3>
                <p className="mt-1 text-sm text-muted-foreground">{about.vision}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Valores</h3>
                <p className="mt-1 text-sm text-muted-foreground">{about.values}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
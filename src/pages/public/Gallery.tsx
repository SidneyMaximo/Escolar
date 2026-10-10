import { useSiteContent } from '../../lib/siteContent';

export function Gallery() {
  const content = useSiteContent();
  const gallery = content.gallery || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Galeria de Fotos</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Conheça nossos espaços e veja como as crianças aprendem e se divertem
        </p>
      </div>
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((img, idx) => (
          <div key={`${img.alt}-${idx}`} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
            <div className="aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={img.src}
                alt={img.alt}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-foreground">{img.alt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
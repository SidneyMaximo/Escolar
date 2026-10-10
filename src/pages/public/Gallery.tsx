const IMAGES = [
  { src: 'https://images.unsplash.com/photo-1587653427964-4f5c5b5e5d5e?auto=format&fit=crop&w=600&q=80', alt: 'Sala de aula' },
  { src: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80', alt: 'Atividades ao ar livre' },
  { src: 'https://images.unsplash.com/photo-1596496050827-8299e0220de1?auto=format&fit=crop&w=600&q=80', alt: 'Artes e criatividade' },
  { src: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80', alt: 'Leitura em grupo' },
  { src: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=600&q=80', alt: 'Parquinho' },
  { src: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=600&q=80', alt: 'Refeição escolar' },
];

export function Gallery() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Galeria de Fotos</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Conheça nossos espaços e veja como as crianças aprendem e se divertem
        </p>
      </div>
      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {IMAGES.map((img) => (
          <div key={img.alt} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
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
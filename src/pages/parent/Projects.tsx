import { useEffect, useState } from 'react';
import { FolderHeart, Image as ImageIcon, Calendar, Sparkles, User, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { StudentProject, Student } from '@/types/database';

export function ParentProjects() {
  const { session } = useAuth();
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [myChildren, setMyChildren] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    async function loadParentMedia() {
      try {
        if (!session?.user.id) return;

        // 1. Buscar filhos vinculados a este pai/responsável
        const { data: childrenData } = await supabase
          .from('students')
          .select('*')
          .eq('parent_guardian_id', session.user.id);

        if (childrenData && childrenData.length > 0) {
          setMyChildren(childrenData);
          const childIds = childrenData.map((c) => c.id);

          // 2. Buscar projetos liberados (is_published = true)
          // que foram vinculados especificamente para esses filhos ou gerais da turma
          const { data: pData } = await supabase
            .from('student_projects')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false });

          if (pData) {
            // Filtra no cliente para garantir que mostra os liberados para o filho ou para turmas dele
            const relevant = pData.filter(
              (p) => !p.student_id || childIds.includes(p.student_id)
            );
            setProjects(relevant);
          }
        } else {
          // Se não há filhos explicitamente vinculados no banco ainda, busca projetos publicados para demonstração
          const { data: pData } = await supabase
            .from('student_projects')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false });

          if (pData) setProjects(pData);
        }
      } catch (err) {
        console.warn('Erro ao carregar projetos para o responsável:', err);
      } finally {
        setLoading(false);
      }
    }
    loadParentMedia();
  }, [session]);

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          Memórias & Desenvolvimento
        </div>
        <h1 className="text-2xl font-bold text-foreground">Fotos de Eventos & Projetos</h1>
        <p className="text-muted-foreground">
          Pastas de fotos, registros pedagógicos e atividades liberadas pelos professores para seu filho.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Carregando fotos e projetos...</div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
          <FolderHeart className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-base font-semibold text-foreground">Nenhuma pasta liberada no momento</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Assim que o professor registrar fotos de projetos, oficinas de arte ou passeios da turma, elas aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((proj) => {
            const coverImage = proj.media_urls?.[0] || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80';
            const childTarget = myChildren.find((c) => c.id === proj.student_id);

            return (
              <div
                key={proj.id}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div
                    onClick={() => setSelectedPhoto(coverImage)}
                    className="relative h-48 w-full bg-muted overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={coverImage}
                      alt={proj.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                      <span className="capitalize">{proj.category}</span>
                    </div>
                    {childTarget && (
                      <div className="absolute bottom-2 left-2 rounded-full bg-primary/90 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur">
                        Exclusivo: {childTarget.full_name}
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-foreground text-base">{proj.title}</h3>
                    {proj.description && (
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                        {proj.description}
                      </p>
                    )}

                    {proj.media_urls && proj.media_urls.length > 1 && (
                      <div className="mt-4 border-t border-border pt-3">
                        <span className="text-xs font-semibold text-muted-foreground">Mais fotos desta pasta:</span>
                        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                          {proj.media_urls.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt="Anexo"
                              onClick={() => setSelectedPhoto(url)}
                              className="h-12 w-12 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity border border-border shrink-0"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border bg-muted/20 px-5 py-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(proj.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <span className="text-primary font-medium">Liberado pelo Professor</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Zoom Foto */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm cursor-zoom-out"
        >
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl shadow-2xl">
            <img src={selectedPhoto} alt="Foto Ampliada" className="max-h-[85vh] w-auto object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}

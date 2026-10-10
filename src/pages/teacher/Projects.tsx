import { useEffect, useState } from 'react';
import { FolderHeart, Plus, Image as ImageIcon, Eye, EyeOff, X, Trash2, Calendar, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { StudentProject, Class, Student } from '@/types/database';

export function TeacherProjects() {
  const { session } = useAuth();
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'projeto' | 'evento' | 'atividades' | 'boletim'>('projeto');
  const [classId, setClassId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  async function loadData() {
    try {
      const teacherId = session?.user.id;
      // Carregar turmas, alunos e projetos
      const [{ data: pData }, { data: cData }, { data: sData }] = await Promise.all([
        supabase
          .from('student_projects')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase.from('classes').select('*'),
        supabase.from('students').select('*').order('full_name'),
      ]);

      if (pData) setProjects(pData);
      if (cData) setClasses(cData);
      if (sData) setStudents(sData);
    } catch (err) {
      console.warn('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [session]);

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user.id) return;
    setSubmitting(true);
    try {
      const urls = photoUrl
        .split('\n')
        .map((u) => u.trim())
        .filter((u) => u.length > 0);

      const { error } = await supabase.from('student_projects').insert({
        school_id: '00000000-0000-0000-0000-000000000001',
        title,
        description,
        category,
        class_id: classId || null,
        student_id: studentId || null,
        teacher_id: session.user.id,
        media_urls: urls.length > 0 ? urls : ['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80'],
        is_published: isPublished,
      });

      if (error) throw error;

      setModalOpen(false);
      setTitle('');
      setDescription('');
      setPhotoUrl('');
      setClassId('');
      setStudentId('');
      await loadData();
      alert('Pasta de fotos e projeto compartilhada com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao criar projeto.');
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePublish(project: StudentProject) {
    try {
      await supabase
        .from('student_projects')
        .update({ is_published: !project.is_published })
        .eq('id', project.id);
      await loadData();
    } catch (err) {
      alert('Erro ao atualizar status.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja excluir esta pasta de fotos/projeto?')) return;
    try {
      await supabase.from('student_projects').delete().eq('id', id);
      await loadData();
    } catch (err) {
      alert('Erro ao excluir projeto.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fotos de Eventos & Projetos dos Alunos</h1>
          <p className="text-muted-foreground">
            Crie pastas de fotos e atividades e libere para os pais visualizarem no portal deles.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nova Pasta de Fotos / Projeto
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          Carregando projetos e fotos...
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
          <FolderHeart className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-base font-semibold text-foreground">Nenhuma pasta compartilhada ainda</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Compartilhe fotos de feiras de ciências, apresentações, desenhos e projetos pedagógicos das crianças.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((proj) => {
            const targetStudent = students.find((s) => s.id === proj.student_id);
            const targetClass = classes.find((c) => c.id === proj.class_id);
            const coverImage = proj.media_urls?.[0] || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80';

            return (
              <div
                key={proj.id}
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-muted overflow-hidden">
                    <img
                      src={coverImage}
                      alt={proj.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                      <span className="capitalize">{proj.category}</span>
                    </div>
                    <button
                      onClick={() => togglePublish(proj)}
                      className={`absolute top-2 right-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur shadow ${
                        proj.is_published
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                      title={proj.is_published ? 'Liberado para os Pais' : 'Oculto aos Pais'}
                    >
                      {proj.is_published ? (
                        <>
                          <Eye className="h-3 w-3" /> Liberado
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" /> Privado
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-foreground text-base leading-snug">{proj.title}</h3>
                    {proj.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{proj.description}</p>
                    )}

                    <div className="mt-3 flex flex-col gap-1 border-t border-border pt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">Destinatário:</span>
                        {targetStudent ? (
                          <span className="text-primary font-medium">Exclusivo: {targetStudent.full_name}</span>
                        ) : targetClass ? (
                          <span>Turma inteira: {targetClass.name}</span>
                        ) : (
                          <span>Todos os alunos</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span>{proj.media_urls?.length || 0} fotos/anexos na pasta</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2.5 text-xs">
                  <span className="text-muted-foreground">
                    {new Date(proj.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <button
                    onClick={() => handleDelete(proj.id)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Criar Pasta / Projeto */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground">Nova Pasta de Fotos / Projeto</h3>
              <button onClick={() => setModalOpen(false)} className="rounded p-1 hover:bg-muted">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">Título do Álbum / Projeto *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Ex: Pintura Coletiva de Primavera ou Feira Cultural"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Descrição / Mensagem aos Pais</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Ex: As crianças exploraram cores primárias e coordenação motora com tinta guache..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground">Categoria</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="projeto">Projeto Pedagógico</option>
                    <option value="evento">Fotos de Eventos</option>
                    <option value="atividades">Atividades do Dia a Dia</option>
                    <option value="boletim">Anexo / Boletim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground">Para qual Turma?</label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="">Selecione a turma...</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">
                  Liberar para um Aluno Específico? (Opcional)
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">Toda a turma pode ver</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      Apenas para: {s.full_name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Se selecionar um aluno específico, apenas o pai/mãe dele terá acesso a esta pasta.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">
                  Links das Fotos (URL das imagens - 1 por linha)
                </label>
                <textarea
                  rows={2}
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-xs outline-none focus:border-primary"
                  placeholder="https://exemplo.com/foto1.jpg&#10;https://exemplo.com/foto2.jpg"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Deixe em branco para usar fotos temáticas demonstrativas.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                <input
                  type="checkbox"
                  id="publishCheck"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary"
                />
                <label htmlFor="publishCheck" className="text-xs font-medium text-foreground cursor-pointer">
                  Liberar imediatamente para visualização dos pais no Portal
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? 'Salvando...' : 'Salvar e Compartilhar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

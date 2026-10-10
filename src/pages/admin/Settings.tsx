import { useEffect, useState } from 'react';
import {
  Save,
  CheckCircle2,
  Globe,
  Building,
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon,
  Sparkles,
  BookOpen,
  Users,
  Puzzle,
  Plus,
  Trash2,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  getLocalSiteContent,
  saveSiteContent,
  type SiteContent,
} from '@/lib/siteContent';
import type { School } from '@/types/database';

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'methodology' | 'team' | 'gallery' | 'school'>('hero');
  const [siteContent, setSiteContent] = useState<SiteContent>(getLocalSiteContent);
  const [schoolId, setSchoolId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadRemoteSchool() {
      try {
        const { data } = await supabase
          .from('schools')
          .select('*')
          .limit(1)
          .maybeSingle();
        if (data) {
          setSchoolId(data.id);
          // Atualiza também no siteContent caso venha do Supabase
          setSiteContent((prev) => ({
            ...prev,
            school: {
              ...prev.school,
              name: data.name || prev.school.name,
              phone: data.phone || prev.school.phone,
              email: data.email || prev.school.email,
              address: data.address ? data.address.split(' - ')[0] : prev.school.address,
              neighborhoodCity: data.address && data.address.includes(' - ') ? data.address.split(' - ').slice(1).join(' - ') : prev.school.neighborhoodCity,
              cnpj: data.cnpj || prev.school.cnpj,
            },
          }));
        }
      } catch (err) {
        console.warn('Erro ao carregar dados da escola:', err);
      }
    }
    loadRemoteSchool();
  }, []);

  function updateSchoolField(field: keyof SiteContent['school'], value: string) {
    setSiteContent((prev) => ({
      ...prev,
      school: {
        ...prev.school,
        [field]: value,
      },
    }));
  }

  async function handleSaveAll(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      // 1. Salvar conteúdo dinâmico do site (Hero, Sobre, Metodologia, Equipe, Galeria, Escola & Endereço)
      await saveSiteContent(siteContent);

      // 2. Salvar dados da escola no Supabase se existir id da escola
      if (schoolId) {
        const fullAddress = [siteContent.school.address, siteContent.school.neighborhoodCity]
          .filter(Boolean)
          .join(' - ');

        await supabase
          .from('schools')
          .update({
            name: siteContent.school.name,
            phone: siteContent.school.phone,
            email: siteContent.school.email,
            address: fullAddress,
            cnpj: siteContent.school.cnpj,
          })
          .eq('id', schoolId);
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      alert('Erro ao salvar as configurações.');
    } finally {
      setSaving(false);
    }
  }

  // Helpers para Galeria
  function addGalleryImage() {
    setSiteContent((prev) => ({
      ...prev,
      gallery: [
        ...prev.gallery,
        {
          src: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80',
          alt: 'Nova Foto da Escola',
        },
      ],
    }));
  }

  function removeGalleryImage(index: number) {
    setSiteContent((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  }

  function updateGalleryImage(index: number, field: 'src' | 'alt', val: string) {
    setSiteContent((prev) => {
      const copy = [...prev.gallery];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, gallery: copy };
    });
  }

  // Helpers para Equipe
  function addTeamMember() {
    setSiteContent((prev) => ({
      ...prev,
      team: [
        ...prev.team,
        {
          name: 'Novo Educador',
          role: 'Professor(a)',
          bio: 'Especialista em educação infantil e metodologias lúdicas.',
        },
      ],
    }));
  }

  function removeTeamMember(index: number) {
    setSiteContent((prev) => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index),
    }));
  }

  function updateTeamMember(index: number, field: string, val: string) {
    setSiteContent((prev) => {
      const copy = [...prev.team];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, team: copy };
    });
  }

  // Helpers para Metodologia
  function addMethodItem() {
    setSiteContent((prev) => ({
      ...prev,
      methodology: {
        ...prev.methodology,
        items: [
          ...prev.methodology.items,
          { title: 'Novo Pilar', desc: 'Descrição da metodologia aplicada...' },
        ],
      },
    }));
  }

  function removeMethodItem(index: number) {
    setSiteContent((prev) => ({
      ...prev,
      methodology: {
        ...prev.methodology,
        items: prev.methodology.items.filter((_, i) => i !== index),
      },
    }));
  }

  function updateMethodItem(index: number, field: 'title' | 'desc', val: string) {
    setSiteContent((prev) => {
      const copy = [...prev.methodology.items];
      copy[index] = { ...copy[index], [field]: val };
      return {
        ...prev,
        methodology: { ...prev.methodology, items: copy },
      };
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gerenciamento do Site & Conteúdo</h1>
          <p className="text-muted-foreground">
            Altere as fotos da Home/Hero, Sobre, Metodologia, Equipe, Galeria e dados da escola.
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-sm text-emerald-600 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Conteúdo e configurações do site atualizados e salvos com sucesso!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto gap-2 text-sm font-medium">
        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-colors shrink-0 ${
            activeTab === 'hero'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          Home / Hero
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-colors shrink-0 ${
            activeTab === 'about'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Sobre Nós
        </button>

        <button
          onClick={() => setActiveTab('methodology')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-colors shrink-0 ${
            activeTab === 'methodology'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Puzzle className="h-4 w-4" />
          Metodologia
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-colors shrink-0 ${
            activeTab === 'team'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4" />
          Equipe
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-colors shrink-0 ${
            activeTab === 'gallery'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Galeria de Fotos
        </button>

        <button
          onClick={() => setActiveTab('school')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-colors shrink-0 ${
            activeTab === 'school'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building className="h-4 w-4" />
          Dados da Escola & Contato
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <form onSubmit={handleSaveAll} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
        {/* ABA: HERO / HOME */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Banner Principal (Hero) da Página Inicial</h2>
              <p className="text-xs text-muted-foreground">
                Configure a imagem de fundo, o slogan e os botões que os visitantes veem na abertura do site.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">
                Foto de Fundo do Banner (URL da Web ou Arquivo na pasta public/) *
              </label>
              <input
                type="text"
                required
                value={siteContent.hero.bgImage}
                onChange={(e) =>
                  setSiteContent({
                    ...siteContent,
                    hero: { ...siteContent.hero, bgImage: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Ex: /Aprender Também É Ser Feliz!.png ou https://images.unsplash.com/..."
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Dica: você pode colocar uma imagem dentro da pasta <code>public/</code> e usar <code>/nome-da-foto.jpg</code> ou colar uma URL completa da web.
              </p>

              {/* Preview da Imagem */}
              {siteContent.hero.bgImage && (
                <div className="mt-3 relative h-40 w-full max-w-lg rounded-xl overflow-hidden border border-border bg-muted">
                  <img
                    src={siteContent.hero.bgImage}
                    alt="Preview Hero"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-semibold">
                    Pré-visualização do Fundo
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">Badge / Tag de Destaque</label>
                <input
                  type="text"
                  value={siteContent.hero.badge}
                  onChange={(e) =>
                    setSiteContent({
                      ...siteContent,
                      hero: { ...siteContent.hero, badge: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Ex: Matrículas abertas 2026"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Texto do Botão Principal</label>
                <input
                  type="text"
                  value={siteContent.hero.ctaPrimaryText}
                  onChange={(e) =>
                    setSiteContent({
                      ...siteContent,
                      hero: { ...siteContent.hero, ctaPrimaryText: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Ex: Matricule-se Agora"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Título Principal da Hero</label>
              <input
                type="text"
                value={siteContent.hero.title}
                onChange={(e) =>
                  setSiteContent({
                    ...siteContent,
                    hero: { ...siteContent.hero, title: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary font-semibold"
                placeholder="Ex: Educação com amor para o futuro do seu filho"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Subtítulo / Descrição da Hero</label>
              <textarea
                rows={3}
                value={siteContent.hero.subtitle}
                onChange={(e) =>
                  setSiteContent({
                    ...siteContent,
                    hero: { ...siteContent.hero, subtitle: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="Texto explicativo apresentado logo abaixo do título principal..."
              />
            </div>
          </div>
        )}

        {/* ABA: SOBRE NÓS */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Página Sobre a Escola</h2>
              <p className="text-xs text-muted-foreground">Conte a história da instituição, sua missão, visão e valores.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">Título da Página</label>
                <input
                  type="text"
                  value={siteContent.about.title}
                  onChange={(e) =>
                    setSiteContent({
                      ...siteContent,
                      about: { ...siteContent.about, title: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Subtítulo / Slogan</label>
                <input
                  type="text"
                  value={siteContent.about.subtitle}
                  onChange={(e) =>
                    setSiteContent({
                      ...siteContent,
                      about: { ...siteContent.about, subtitle: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Nossa História — Parágrafo 1</label>
              <textarea
                rows={3}
                value={siteContent.about.historyParagraph1}
                onChange={(e) =>
                  setSiteContent({
                    ...siteContent,
                    about: { ...siteContent.about, historyParagraph1: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Nossa História — Parágrafo 2</label>
              <textarea
                rows={3}
                value={siteContent.about.historyParagraph2}
                onChange={(e) =>
                  setSiteContent({
                    ...siteContent,
                    about: { ...siteContent.about, historyParagraph2: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3 border-t border-border pt-4">
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider">Missão</label>
                <textarea
                  rows={3}
                  value={siteContent.about.mission}
                  onChange={(e) =>
                    setSiteContent({
                      ...siteContent,
                      about: { ...siteContent.about, mission: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider">Visão</label>
                <textarea
                  rows={3}
                  value={siteContent.about.vision}
                  onChange={(e) =>
                    setSiteContent({
                      ...siteContent,
                      about: { ...siteContent.about, vision: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider">Valores</label>
                <textarea
                  rows={3}
                  value={siteContent.about.values}
                  onChange={(e) =>
                    setSiteContent({
                      ...siteContent,
                      about: { ...siteContent.about, values: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* ABA: METODOLOGIA */}
        {activeTab === 'methodology' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Metodologia Pedagógica</h2>
                <p className="text-xs text-muted-foreground">Pilares pedagógicos e diretrizes de ensino da escola.</p>
              </div>
              <button
                type="button"
                onClick={addMethodItem}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar Pilar
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">Título da Página</label>
                <input
                  type="text"
                  value={siteContent.methodology.title}
                  onChange={(e) =>
                    setSiteContent({
                      ...siteContent,
                      methodology: { ...siteContent.methodology, title: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Texto de Alinhamento BNCC</label>
                <input
                  type="text"
                  value={siteContent.methodology.bnccText}
                  onChange={(e) =>
                    setSiteContent({
                      ...siteContent,
                      methodology: { ...siteContent.methodology, bnccText: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Pilares e Métodos Exibidos
              </span>
              <div className="grid gap-3 sm:grid-cols-2">
                {siteContent.methodology.items.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-border p-3 space-y-2 bg-muted/20 relative group">
                    <button
                      type="button"
                      onClick={() => removeMethodItem(idx)}
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive p-1 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateMethodItem(idx, 'title', e.target.value)}
                      className="w-full pr-8 rounded border border-input bg-background px-2.5 py-1 text-sm font-bold text-foreground outline-none focus:border-primary"
                      placeholder="Título do Método"
                    />
                    <textarea
                      rows={2}
                      value={item.desc}
                      onChange={(e) => updateMethodItem(idx, 'desc', e.target.value)}
                      className="w-full rounded border border-input bg-background px-2.5 py-1 text-xs text-muted-foreground outline-none focus:border-primary"
                      placeholder="Descrição do método..."
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA: EQUIPE */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Equipe e Educadores</h2>
                <p className="text-xs text-muted-foreground">Profissionais exibidos na página pública "Equipe".</p>
              </div>
              <button
                type="button"
                onClick={addTeamMember}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar Educador
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {siteContent.team.map((member, idx) => (
                <div key={idx} className="rounded-xl border border-border p-4 space-y-3 bg-muted/20 relative">
                  <button
                    type="button"
                    onClick={() => removeTeamMember(idx)}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive p-1 rounded"
                    title="Remover"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div>
                    <label className="block text-xs font-semibold text-foreground">Nome</label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateTeamMember(idx, 'name', e.target.value)}
                      className="mt-0.5 w-full rounded border border-input bg-background px-2.5 py-1 text-sm font-bold text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground">Cargo / Especialidade</label>
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => updateTeamMember(idx, 'role', e.target.value)}
                      className="mt-0.5 w-full rounded border border-input bg-background px-2.5 py-1 text-xs text-secondary font-medium outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground">URL da Foto do Educador (Web ou pasta public/)</label>
                    <div className="flex gap-2 items-center mt-1">
                      {member.photoUrl ? (
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          className="h-9 w-9 rounded-full object-cover shrink-0 border border-primary/30"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                          <Users className="h-4 w-4" />
                        </div>
                      )}
                      <input
                        type="text"
                        value={member.photoUrl || ''}
                        onChange={(e) => updateTeamMember(idx, 'photoUrl', e.target.value)}
                        placeholder="https://... ou /foto.jpg"
                        className="w-full rounded border border-input bg-background px-2.5 py-1 text-xs text-muted-foreground outline-none focus:border-primary font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground">Biografia Resumida</label>
                    <textarea
                      rows={2}
                      value={member.bio}
                      onChange={(e) => updateTeamMember(idx, 'bio', e.target.value)}
                      className="mt-0.5 w-full rounded border border-input bg-background px-2.5 py-1 text-xs text-muted-foreground outline-none focus:border-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA: GALERIA DE FOTOS */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Fotos da Galeria Pública</h2>
                <p className="text-xs text-muted-foreground">
                  Fotos dos espaços escolares, parquinhos e salas de aula exibidos em <code>/galeria</code>.
                </p>
              </div>
              <button
                type="button"
                onClick={addGalleryImage}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-3.5 w-3.5" /> Nova Foto
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {siteContent.gallery.map((img, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-card overflow-hidden shadow-sm flex flex-col justify-between">
                  <div className="relative h-44 w-full bg-muted">
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.opacity = '0.4';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute top-2 right-2 bg-black/70 text-white hover:bg-destructive p-1.5 rounded-lg transition-colors"
                      title="Excluir Foto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="p-3 space-y-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground">Legenda da Foto</label>
                      <input
                        type="text"
                        value={img.alt}
                        onChange={(e) => updateGalleryImage(idx, 'alt', e.target.value)}
                        className="mt-0.5 w-full rounded border border-input bg-background px-2 py-1 text-xs font-medium text-foreground outline-none focus:border-primary"
                        placeholder="Ex: Parquinho Infantil"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground">URL da Imagem</label>
                      <input
                        type="text"
                        value={img.src}
                        onChange={(e) => updateGalleryImage(idx, 'src', e.target.value)}
                        className="mt-0.5 w-full rounded border border-input bg-background px-2 py-1 text-xs font-mono text-muted-foreground outline-none focus:border-primary"
                        placeholder="https://... ou /foto.jpg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA: DADOS DA ESCOLA & CONTATO */}
        {activeTab === 'school' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Informações Institucionais & Canais de Contato</h2>
              <p className="text-xs text-muted-foreground">
                Dados cadastrais e meios de comunicação apresentados no cabeçalho, rodapé e página de contato.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">Nome Oficial da Escola *</label>
                <input
                  type="text"
                  required
                  value={siteContent.school.name}
                  onChange={(e) => updateSchoolField('name', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary font-semibold"
                  placeholder="Ex: Escola Infantil Futuro Feliz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Slogan Institucional</label>
                <input
                  type="text"
                  value={siteContent.school.slogan}
                  onChange={(e) => updateSchoolField('slogan', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Ex: Educação de qualidade com amor e dedicação"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">CNPJ</label>
                <input
                  type="text"
                  value={siteContent.school.cnpj}
                  onChange={(e) => updateSchoolField('cnpj', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="00.000.000/0001-00"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Phone className="h-4 w-4 text-muted-foreground" /> Telefone Principal *
                </label>
                <input
                  type="text"
                  required
                  value={siteContent.school.phone}
                  onChange={(e) => updateSchoolField('phone', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="(11) 1234-5678"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Phone className="h-4 w-4 text-muted-foreground" /> Telefone Secundário / WhatsApp
                </label>
                <input
                  type="text"
                  value={siteContent.school.phoneSecondary || ''}
                  onChange={(e) => updateSchoolField('phoneSecondary', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="(11) 98765-4321"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Mail className="h-4 w-4 text-muted-foreground" /> E-mail Geral de Contato *
                </label>
                <input
                  type="email"
                  required
                  value={siteContent.school.email}
                  onChange={(e) => updateSchoolField('email', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="contato@escola.com.br"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Mail className="h-4 w-4 text-muted-foreground" /> E-mail de Matrículas
                </label>
                <input
                  type="email"
                  value={siteContent.school.emailSecondary || ''}
                  onChange={(e) => updateSchoolField('emailSecondary', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="matriculas@escola.com.br"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> Endereço (Rua, Número) *
                </label>
                <input
                  type="text"
                  required
                  value={siteContent.school.address}
                  onChange={(e) => updateSchoolField('address', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary font-medium"
                  placeholder="Ex: Av. Paulista, 1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Bairro, Cidade e Estado</label>
                <input
                  type="text"
                  value={siteContent.school.neighborhoodCity}
                  onChange={(e) => updateSchoolField('neighborhoodCity', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Ex: Bela Vista - São Paulo, SP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">CEP</label>
                <input
                  type="text"
                  value={siteContent.school.cep || ''}
                  onChange={(e) => updateSchoolField('cep', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="01310-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Horário (Segunda a Sexta)</label>
                <input
                  type="text"
                  value={siteContent.school.openingHoursWeekdays}
                  onChange={(e) => updateSchoolField('openingHoursWeekdays', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Ex: Segunda a Sexta: 7h às 18h"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Horário (Sábado)</label>
                <input
                  type="text"
                  value={siteContent.school.openingHoursSaturday}
                  onChange={(e) => updateSchoolField('openingHoursSaturday', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Ex: Sábado: 8h às 12h"
                />
              </div>
            </div>

            {/* Caixa de Pré-visualização Instantânea */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                Pré-visualização do Rodapé / Contato
              </span>
              <div className="text-xs text-foreground space-y-1">
                <p><strong>Escola:</strong> {siteContent.school.name}</p>
                <p><strong>Endereço:</strong> {siteContent.school.address} {siteContent.school.neighborhoodCity ? `- ${siteContent.school.neighborhoodCity}` : ''} {siteContent.school.cep ? `(CEP: ${siteContent.school.cep})` : ''}</p>
                <p><strong>Contatos:</strong> {siteContent.school.phone} {siteContent.school.phoneSecondary ? `| ${siteContent.school.phoneSecondary}` : ''} • {siteContent.school.email}</p>
                <p><strong>Funcionamento:</strong> {siteContent.school.openingHoursWeekdays} • {siteContent.school.openingHoursSaturday}</p>
              </div>
            </div>
          </div>
        )}

        {/* Rodapé com botão Salvar */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Todas as alterações salvas aqui são refletidas imediatamente nas páginas públicas do site.
          </span>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}

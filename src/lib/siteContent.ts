import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface SchoolInfo {
  name: string;
  slogan: string;
  phone: string;
  phoneSecondary: string;
  email: string;
  emailSecondary: string;
  address: string;
  neighborhoodCity: string;
  cep: string;
  openingHoursWeekdays: string;
  openingHoursSaturday: string;
  openingHoursSunday: string;
  cnpj: string;
}

export interface SiteContent {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    bgImage: string;
    ctaPrimaryText: string;
    ctaSecondaryText: string;
  };
  about: {
    title: string;
    subtitle: string;
    historyParagraph1: string;
    historyParagraph2: string;
    mission: string;
    vision: string;
    values: string;
  };
  methodology: {
    title: string;
    subtitle: string;
    bnccText: string;
    items: Array<{
      title: string;
      desc: string;
    }>;
  };
  team: Array<{
    name: string;
    role: string;
    bio: string;
    photoUrl?: string;
  }>;
  gallery: Array<{
    src: string;
    alt: string;
  }>;
  school: SchoolInfo;
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    badge: 'Matrículas abertas 2026',
    title: 'Educação com amor para o futuro do seu filho',
    subtitle: 'Na Escola Infantil, cada criança é única. Nossa metodologia combina aprendizado lúdico, desenvolvimento socioemocional e excelência acadêmica em um ambiente seguro e acolhedor.',
    bgImage: '/Aprender%20Tamb%C3%A9m%20%C3%89%20Ser%20Feliz!.png',
    ctaPrimaryText: 'Matricule-se Agora',
    ctaSecondaryText: 'Conheça a Escola',
  },
  about: {
    title: 'Sobre Nossa Escola',
    subtitle: 'Há mais de 20 anos formando cidadãos conscientes e felizes',
    historyParagraph1: 'Fundada em 2005, a Escola Infantil nasceu do sonho de criar um espaço educativo onde cada criança pudesse desenvolver seu potencial máximo. Ao longo dos anos, nos tornamos referência em educação infantil e ensino fundamental na região.',
    historyParagraph2: 'Nossa equipe é formada por profissionais apaixonados pela educação, com formação continuada e especializações nas áreas de pedagogia, psicologia infantil e desenvolvimento cognitivo.',
    mission: 'Proporcionar educação de qualidade que promova o desenvolvimento integral da criança.',
    vision: 'Ser referência em educação infantil, reconhecida pela excelência e inovação pedagógica.',
    values: 'Respeito, responsabilidade, cooperação, solidariedade e compromisso com a aprendizagem.',
  },
  methodology: {
    title: 'Nossa Metodologia',
    subtitle: 'Combinamos as melhores práticas educacionais com carinho e atenção individual para garantir o desenvolvimento integral de cada criança.',
    bnccText: 'Nosso currículo segue integralmente a Base Nacional Comum Curricular, garantindo que todas as competências e habilidades essenciais sejam trabalhadas de forma contextualizada e significativa.',
    items: [
      { title: 'Aprendizado Lúdico', desc: 'Jogos e brincadeiras como ferramentas pedagógicas para desenvolver raciocínio lógico e criatividade.' },
      { title: 'Artes e Música', desc: 'Expressão artística integrada ao currículo, estimulando sensibilidade e coordenação motora.' },
      { title: 'Natureza e Sustentabilidade', desc: 'Contato com a natureza através de horta escolar e atividades ao ar livre.' },
      { title: 'Socioemocional', desc: 'Desenvolvimento de habilidades como empatia, cooperação e autonomia desde cedo.' },
      { title: 'Projetos Investigativos', desc: 'Crianças como protagonistas do aprendizado, explorando temas de interesse coletivo.' },
      { title: 'Multilinguagem', desc: 'Inglês introdutório, linguagem corporal, digital e artística integradas ao dia a dia.' },
    ],
  },
  team: [
    { name: 'Ana Silva', role: 'Diretora Pedagógica', bio: 'Pedagoga com 15 anos de experiência em educação infantil.' },
    { name: 'Carlos Santos', role: 'Coordenador Acadêmico', bio: 'Mestre em Educação, especialista em currículo BNCC.' },
    { name: 'Maria Oliveira', role: 'Professora Regente', bio: 'Licenciada em Pedagogia, apaixonada por alfabetização.' },
    { name: 'João Pereira', role: 'Professor de Artes', bio: 'Artista plástico e educador, estimula criatividade.' },
    { name: 'Fernanda Lima', role: 'Psicóloga Escolar', bio: 'Especialista em desenvolvimento infantil e socioemocional.' },
    { name: 'Roberto Alves', role: 'Professor de Educação Física', bio: 'Foca em psicomotricidade e atividades lúdicas.' },
  ],
  gallery: [
    { src: 'https://images.unsplash.com/photo-1587653427964-4f5c5b5e5d5e?auto=format&fit=crop&w=600&q=80', alt: 'Sala de aula lúdica' },
    { src: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80', alt: 'Atividades ao ar livre' },
    { src: 'https://images.unsplash.com/photo-1596496050827-8299e0220de1?auto=format&fit=crop&w=600&q=80', alt: 'Artes e criatividade' },
    { src: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80', alt: 'Hora da leitura em grupo' },
    { src: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=600&q=80', alt: 'Parquinho e recreação' },
    { src: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=600&q=80', alt: 'Alimentação saudável escolar' },
  ],
  school: {
    name: 'Escola Infantil',
    slogan: 'Educação de qualidade com amor e dedicação para o desenvolvimento integral do seu filho.',
    phone: '(11) 1234-5678',
    phoneSecondary: '(11) 98765-4321',
    email: 'contato@escolainfantil.com.br',
    emailSecondary: 'matriculas@escolainfantil.com.br',
    address: 'Rua das Flores, 123',
    neighborhoodCity: 'Jardim Primavera - São Paulo, SP',
    cep: '01234-567',
    openingHoursWeekdays: 'Segunda a Sexta: 7h às 18h',
    openingHoursSaturday: 'Sábado: 8h às 12h',
    openingHoursSunday: 'Domingo: Fechado',
    cnpj: '12.345.678/0001-90',
  },
};

const STORAGE_KEY = 'escola_saas_site_content';

export function getLocalSiteContent(): SiteContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SITE_CONTENT,
        ...parsed,
        school: {
          ...DEFAULT_SITE_CONTENT.school,
          ...(parsed.school || {}),
        },
      };
    }
  } catch (e) {
    console.warn('Erro ao ler site_content local:', e);
  }
  return DEFAULT_SITE_CONTENT;
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  // 1. Salva no localStorage imediatamente para reatividade em tempo real no frontend
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    window.dispatchEvent(new Event('site_content_updated'));
  } catch (e) {
    console.warn('Erro ao salvar localmente:', e);
  }

  // 2. Tenta sincronizar com a tabela site_content no Supabase
  try {
    await supabase.from('site_content').upsert({
      school_id: '00000000-0000-0000-0000-000000000001',
      hero: content.hero,
      about: content.about,
      methodology: content.methodology,
      team: content.team,
      gallery: content.gallery,
      school: content.school,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Supabase site_content sync pendente:', err);
  }

  // 3. Tenta sincronizar com a tabela schools no Supabase
  try {
    if (content.school) {
      const fullAddress = [content.school.address, content.school.neighborhoodCity]
        .filter(Boolean)
        .join(' - ');

      await supabase.from('schools').upsert({
        id: '00000000-0000-0000-0000-000000000001',
        name: content.school.name,
        phone: content.school.phone,
        email: content.school.email,
        address: fullAddress,
        cnpj: content.school.cnpj || null,
        slug: 'escola-infantil',
        updated_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Supabase schools sync:', err);
  }
}

export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(getLocalSiteContent);

  useEffect(() => {
    async function loadRemote() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('*')
          .eq('school_id', '00000000-0000-0000-0000-000000000001')
          .maybeSingle();

        if (!error && data) {
          const merged: SiteContent = {
            hero: data.hero && Object.keys(data.hero).length > 0 ? data.hero : DEFAULT_SITE_CONTENT.hero,
            about: data.about && Object.keys(data.about).length > 0 ? data.about : DEFAULT_SITE_CONTENT.about,
            methodology: data.methodology && Object.keys(data.methodology).length > 0 ? data.methodology : DEFAULT_SITE_CONTENT.methodology,
            team: Array.isArray(data.team) && data.team.length > 0 ? data.team : DEFAULT_SITE_CONTENT.team,
            gallery: Array.isArray(data.gallery) && data.gallery.length > 0 ? data.gallery : DEFAULT_SITE_CONTENT.gallery,
            school: data.school && Object.keys(data.school).length > 0 ? { ...DEFAULT_SITE_CONTENT.school, ...data.school } : DEFAULT_SITE_CONTENT.school,
          };
          setContent(merged);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        }
      } catch (err) {
        // Silencioso se a tabela ainda não existir no Supabase
      }
    }

    loadRemote();

    function handleUpdate() {
      setContent(getLocalSiteContent());
    }

    window.addEventListener('site_content_updated', handleUpdate);
    return () => window.removeEventListener('site_content_updated', handleUpdate);
  }, []);

  return content;
}

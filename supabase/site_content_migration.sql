-- ================================================================
-- TABELA DE CONTEÚDO DINÂMICO DO SITE (HERO, SOBRE, METODOLOGIA, EQUIPE, GALERIA, DADOS DA ESCOLA)
-- Permite ao Admin alterar fotos, textos, contatos e endereço diretamente no painel
-- ================================================================

CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  hero JSONB NOT NULL DEFAULT '{}'::jsonb,
  about JSONB NOT NULL DEFAULT '{}'::jsonb,
  methodology JSONB NOT NULL DEFAULT '{}'::jsonb,
  team JSONB NOT NULL DEFAULT '[]'::jsonb,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  school JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_site_content_school UNIQUE (school_id)
);

-- Habilitar RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- 1. Qualquer visitante pode ler o conteúdo público do site
DROP POLICY IF EXISTS "Public can view site content" ON public.site_content;
CREATE POLICY "Public can view site content"
  ON public.site_content
  FOR SELECT
  USING (true);

-- 2. Apenas administradores ou usuários autenticados da escola podem atualizar
DROP POLICY IF EXISTS "Admins can insert and update site content" ON public.site_content;
CREATE POLICY "Admins can insert and update site content"
  ON public.site_content
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Inserir registro inicial padrão se a escola padrão existir
INSERT INTO public.site_content (
  school_id,
  hero,
  about,
  methodology,
  team,
  gallery,
  school
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '{
    "badge": "Matrículas abertas 2026",
    "title": "Educação com amor para o futuro do seu filho",
    "subtitle": "Na Escola Infantil, cada criança é única. Nossa metodologia combina aprendizado lúdico, desenvolvimento socioemocional e excelência acadêmica em um ambiente seguro e acolhedor.",
    "bgImage": "/Aprender%20Tamb%C3%A9m%20%C3%89%20Ser%20Feliz!.png",
    "ctaPrimaryText": "Matricule-se Agora",
    "ctaSecondaryText": "Conheça a Escola"
  }'::jsonb,
  '{
    "title": "Sobre Nossa Escola",
    "subtitle": "Há mais de 20 anos formando cidadãos conscientes e felizes",
    "historyParagraph1": "Fundada em 2005, a Escola Infantil nasceu do sonho de criar um espaço educativo onde cada criança pudesse desenvolver seu potencial máximo.",
    "historyParagraph2": "Nossa equipe é formada por profissionais apaixonados pela educação com capacitação continuada.",
    "mission": "Proporcionar educação de qualidade que promova o desenvolvimento integral da criança.",
    "vision": "Ser referência em educação infantil, reconhecida pela excelência pedagógica.",
    "values": "Respeito, responsabilidade, cooperação, solidariedade e amor ao aprendizado."
  }'::jsonb,
  '{
    "title": "Nossa Metodologia",
    "subtitle": "Combinamos as melhores práticas educacionais com carinho e atenção individual.",
    "bnccText": "Nosso currículo segue integralmente a Base Nacional Comum Curricular (BNCC).",
    "items": [
      {"title": "Aprendizado Lúdico", "desc": "Jogos e brincadeiras como ferramentas pedagógicas."},
      {"title": "Artes e Música", "desc": "Expressão artística estimulando sensibilidade e motricidade."},
      {"title": "Natureza e Sustentabilidade", "desc": "Contato com horta escolar e atividades ao ar livre."},
      {"title": "Socioemocional", "desc": "Desenvolvimento de empatia, escuta e inteligência emocional."}
    ]
  }'::jsonb,
  '[
    {"name": "Ana Silva", "role": "Diretora Pedagógica", "bio": "Pedagoga com 15 anos de experiência em educação infantil."},
    {"name": "Carlos Santos", "role": "Coordenador Acadêmico", "bio": "Mestre em Educação, especialista em currículo BNCC."},
    {"name": "Maria Oliveira", "role": "Professora Regente", "bio": "Licenciada em Pedagogia, apaixonada por alfabetização."}
  ]'::jsonb,
  '[
    {"src": "https://images.unsplash.com/photo-1587653427964-4f5c5b5e5d5e?auto=format&fit=crop&w=600&q=80", "alt": "Sala de aula lúdica"},
    {"src": "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80", "alt": "Atividades ao ar livre"},
    {"src": "https://images.unsplash.com/photo-1596496050827-8299e0220de1?auto=format&fit=crop&w=600&q=80", "alt": "Artes e criatividade"}
  ]'::jsonb,
  '{
    "name": "Escola Infantil",
    "slogan": "Educação de qualidade com amor e dedicação para o desenvolvimento integral do seu filho.",
    "phone": "(11) 1234-5678",
    "phoneSecondary": "(11) 98765-4321",
    "email": "contato@escolainfantil.com.br",
    "emailSecondary": "matriculas@escolainfantil.com.br",
    "address": "Rua das Flores, 123",
    "neighborhoodCity": "Jardim Primavera - São Paulo, SP",
    "cep": "01234-567",
    "openingHoursWeekdays": "Segunda a Sexta: 7h às 18h",
    "openingHoursSaturday": "Sábado: 8h às 12h",
    "openingHoursSunday": "Domingo: Fechado",
    "cnpj": "12.345.678/0001-90"
  }'::jsonb
)
ON CONFLICT (school_id) DO NOTHING;

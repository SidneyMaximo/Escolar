-- ================================================================
-- TABELA DE MATRÍCULAS ESCOLARES (ENROLLMENTS)
-- Permite armazenamento de pré-matrículas e fichas de matrícula
-- ================================================================

CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'matricula',
  student_name TEXT NOT NULL,
  student_dob DATE,
  parent_name TEXT NOT NULL,
  parent_email TEXT,
  parent_phone TEXT NOT NULL,
  parent_cpf TEXT,
  address JSONB,
  previous_school TEXT,
  medical_info TEXT,
  documents JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 1. Qualquer visitante pode submeter solicitação de matrícula no site público
DROP POLICY IF EXISTS "Public can insert enrollment" ON public.enrollments;
CREATE POLICY "Public can insert enrollment"
  ON public.enrollments
  FOR INSERT
  WITH CHECK (true);

-- 2. Administradores da escola podem visualizar todas as matrículas
DROP POLICY IF EXISTS "Admins can view enrollments" ON public.enrollments;
CREATE POLICY "Admins can view enrollments"
  ON public.enrollments
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. Administradores podem atualizar status (aprovar / recusar)
DROP POLICY IF EXISTS "Admins can update enrollments" ON public.enrollments;
CREATE POLICY "Admins can update enrollments"
  ON public.enrollments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Inserção de dados de exemplo caso a tabela esteja vazia
INSERT INTO public.enrollments (
  id,
  school_id,
  type,
  student_name,
  student_dob,
  parent_name,
  parent_email,
  parent_phone,
  parent_cpf,
  address,
  previous_school,
  medical_info,
  status
)
VALUES
(
  'e1010000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'matricula',
  'Lucas Gabriel Ferreira',
  '2020-05-14',
  'Camila Ferreira Ramos',
  'camila.ferreira@gmail.com',
  '(11) 98765-4321',
  '234.567.890-12',
  '{"street": "Rua das Camélias, 240 - Jardim das Flores - São Paulo, SP"}'::jsonb,
  'Centro Educacional Infantil Pequeno Príncipe',
  'Rinite alérgica leve. Sem restrições alimentares.',
  'pending'
),
(
  'e1020000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'matricula',
  'Sophia Helena Rodrigues',
  '2019-11-20',
  'Rodrigo Rodrigues Alves',
  'rodrigo.alves@hotmail.com',
  '(11) 97654-3210',
  '345.678.901-23',
  '{"street": "Av. Brigadeiro Luis Antonio, 1800 - Bela Vista - São Paulo, SP"}'::jsonb,
  'Escola Maternal Sonho Meu',
  'Alergia a frutos do mar.',
  'approved'
)
ON CONFLICT (id) DO NOTHING;

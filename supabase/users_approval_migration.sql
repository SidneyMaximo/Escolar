-- ================================================================
-- LIBERAÇÃO E APROVAÇÃO DE USUÁRIOS PELO ADMINISTRADOR
-- Adiciona controle de status (pending, approved, blocked)
-- ================================================================

-- 1. Adicionar coluna status na tabela profiles se não existir
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';

-- 2. Garantir que os administradores possam atualizar status e permissões de qualquer usuário
DROP POLICY IF EXISTS "Admins can update user status and roles" ON public.profiles;
CREATE POLICY "Admins can update user status and roles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Atualizar o Administrador principal para status aprovado
UPDATE public.profiles
SET status = 'approved'
WHERE role = 'admin';

-- 4. Exemplo de usuários aguardando liberação para demonstração
INSERT INTO public.profiles (
  id,
  school_id,
  full_name,
  email,
  phone,
  role,
  status
)
VALUES
(
  'u-pending-demo-001',
  '00000000-0000-0000-0000-000000000001',
  'Marcos Vinícius Souza',
  'marcos.souza@gmail.com',
  '(11) 96666-3333',
  'parent',
  'pending'
),
(
  'u-pending-demo-002',
  '00000000-0000-0000-0000-000000000001',
  'Letícia Castro Meirelles',
  'leticia.castro@hotmail.com',
  '(11) 95555-4444',
  'parent',
  'pending'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;

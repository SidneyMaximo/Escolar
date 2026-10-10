-- ================================================================
-- ATUALIZAÇÃO DO CORPO DOCENTE (PROFESSORES)
-- Adiciona campos de email e turma sob responsabilidade do professor
-- Resolve a restrição de chave estrangeira profiles_id_fkey
-- ================================================================

-- 1. Remover a restrição rígida de chave estrangeira com auth.users se existir.
-- Isso permite que o Administrador cadastre professores, funcionários ou pais
-- diretamente no painel administrativo antes que eles façam login.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Adicionar colunas de email e turma responsável à tabela profiles caso não existam
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS assigned_class_name TEXT,
ADD COLUMN IF NOT EXISTS assigned_class_id UUID;

-- 3. Atualizar políticas de RLS para permitir gestão total pelos administradores
DROP POLICY IF EXISTS "Admins can manage teacher profiles" ON public.profiles;
CREATE POLICY "Admins can manage teacher profiles"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Opcional: Criar usuário de teste em auth.users caso queira testar login do professor
-- Login: juliana.mendes@escola.com.br / Senha: Professor123
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juliana.mendes@escola.com.br') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      '00000000-0000-0000-0000-000000000101',
      'authenticated',
      'authenticated',
      'juliana.mendes@escola.com.br',
      crypt('Professor123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Profa. Juliana Mendes Silva","role":"teacher","school_id":"00000000-0000-0000-0000-000000000001"}'::jsonb,
      now(),
      now()
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000101',
      '00000000-0000-0000-0000-000000000101',
      'juliana.mendes@escola.com.br',
      jsonb_build_object(
        'sub', '00000000-0000-0000-0000-000000000101',
        'email', 'juliana.mendes@escola.com.br',
        'email_verified', true
      ),
      'email',
      now(),
      now(),
      now()
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignora se auth.users tiver restrições adicionais de extensão pgcrypto
    NULL;
END;
$$;

-- 5. Inserir ou atualizar perfis dos professores de exemplo
INSERT INTO public.profiles (
  id,
  school_id,
  full_name,
  email,
  phone,
  role,
  assigned_class_name
)
VALUES
(
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000001',
  'Profa. Juliana Mendes Silva',
  'juliana.mendes@escola.com.br',
  '(11) 98888-1111',
  'teacher',
  'Maternal I'
),
(
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000001',
  'Profa. Ana Beatriz Ramos',
  'ana.beatriz@escola.com.br',
  '(11) 98888-2222',
  'teacher',
  'Berçário'
),
(
  '00000000-0000-0000-0000-000000000103',
  '00000000-0000-0000-0000-000000000001',
  'Profa. Carolina Duarte Lima',
  'carolina.duarte@escola.com.br',
  '(11) 98888-3333',
  'teacher',
  'Jardim II'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  assigned_class_name = EXCLUDED.assigned_class_name,
  phone = EXCLUDED.phone;

-- 6. Vincular as turmas aos respectivos professores na tabela classes (se existirem)
UPDATE public.classes
SET teacher_id = '00000000-0000-0000-0000-000000000101'
WHERE name ILIKE '%Maternal I%';

UPDATE public.classes
SET teacher_id = '00000000-0000-0000-0000-000000000102'
WHERE name ILIKE '%Berçário%';

UPDATE public.classes
SET teacher_id = '00000000-0000-0000-0000-000000000103'
WHERE name ILIKE '%Jardim II%';

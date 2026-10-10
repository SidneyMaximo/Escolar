-- ============================================================================
-- CRIAR USUÁRIO ADMINISTRADOR PADRÃO
-- Execute este script no SQL Editor do Supabase Dashboard
-- ⚠️ Execute APENAS UMA VEZ. Após criar o admin, mantenha este arquivo seguro.
-- ============================================================================

-- 1. Garantir que a escola padrão existe
INSERT INTO schools (id, name, slug, primary_color)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Escola Infantil',
  'escola-infantil',
  '#0D9488'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Criar usuário admin diretamente em auth.users
-- Usa crypt() + gen_salt('bf') para hash bcrypt da senha (compatível com Supabase Auth)
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
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
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'Admin@diretor',
    crypt('Diretor', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Administrador Diretor","role":"admin","school_id":"00000000-0000-0000-0000-000000000001"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- 3. Criar identity (necessário para login funcionar no Supabase Auth v2)
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
    new_user_id,
    new_user_id,
    'Admin@diretor',
    jsonb_build_object(
      'sub', new_user_id::text,
      'email', 'Admin@diretor',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
  );

  -- 4. Criar profile manualmente (caso trigger não dispare dentro do DO block)
  INSERT INTO public.profiles (id, school_id, full_name, role)
  VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000001',
    'Administrador Diretor',
    'admin'::app_role
  )
  ON CONFLICT (id) DO UPDATE SET role = 'admin'::app_role;

  RAISE NOTICE 'Admin criado com sucesso! ID: %', new_user_id;
END;
$$;

-- 5. Verificar se o admin foi criado com sucesso
SELECT
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as meta_role,
  u.raw_user_meta_data->>'full_name' as full_name,
  u.email_confirmed_at IS NOT NULL as email_confirmed,
  p.role as profile_role,
  p.school_id
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'Admin@diretor';

-- ============================================================================
-- CREDENCIAIS DE ACESSO:
--   Email:    Admin@diretor
--   Senha:    Diretor
--   Acesso:   http://localhost:5174/entrar → redireciona para /admin
-- ============================================================================
--
-- ⚠️ SEGURANÇA:
-- 1. Após o primeiro login, ALTERE a senha imediatamente
-- 2. crypt() + gen_salt('bf') gera hash bcrypt compatível com Supabase Auth
-- 3. auth.identities é necessário para login funcionar (Supabase Auth v2)
-- 4. Profile criado manualmente dentro do DO block (não depende do trigger)
-- 5. NUNCA commitar este arquivo com credenciais reais no GitHub
-- ============================================================================
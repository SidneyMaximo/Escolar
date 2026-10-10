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

-- 2. Criar usuário admin via função do Supabase Auth
-- Esta abordagem usa a API interna do Supabase para criar o usuário com senha hash segura
SELECT auth.admin_create_user(
  '{"email":"Admin@diretor","password":"Diretor","email_confirm":true,"user_metadata":{"full_name":"Administrador Diretor","role":"admin","school_id":"00000000-0000-0000-0000-000000000001"}}'::jsonb
);

-- 3. Verificar se o admin foi criado com sucesso
SELECT
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as role,
  u.raw_user_meta_data->>'full_name' as full_name,
  u.created_at,
  p.school_id,
  p.role as profile_role
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
-- 2. Este script usa email_confirm:true para ativar a conta sem verificação
-- 3. O trigger handle_new_user cria o profile automaticamente com role='admin'
-- 4. NUNCA commitar este arquivo com credenciais reais no GitHub
-- ============================================================================

-- 4. (OPCIONAL) Se o trigger não criou o profile, execute manualmente:
-- INSERT INTO public.profiles (id, school_id, full_name, role)
-- SELECT id, '00000000-0000-0000-0000-000000000001', 'Administrador Diretor', 'admin'::app_role
-- FROM auth.users WHERE email = 'Admin@diretor'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin'::app_role;
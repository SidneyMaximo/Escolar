# Escola Infantil SaaS — Documentação Técnica

## 1. Visão Geral do Projeto

Aplicação SaaS para gestão escolar de educação infantil e ensino fundamental. Combina site público institucional, painel administrativo, portal do professor e portal dos pais em uma única aplicação React com backend Supabase.

### Funcionalidades Principais

| Módulo | Descrição |
|--------|-----------|
| **Site Público** | Home, Sobre, Metodologia, Equipe, Galeria, Depoimentos, FAQ, Contato, Matrícula Online, Rematrícula Online |
| **Painel Admin** | Dashboard KPI, CRUD alunos/professores/turmas, aprovação de matrículas, gestão de notas/boletins, gerenciamento de usuários |
| **Portal Professor** | Dashboard, turmas atribuídas, lançamento de notas e frequência |
| **Portal Pais** | Dashboard, visualização de filhos, notas, boletins e mensagens |
| **Autenticação** | Login, cadastro, recuperação de senha, RBAC por role (admin/teacher/parent) |

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend Framework | React + TypeScript | 19 / 5.7 |
| Build Tool | Vite | 8.x |
| Styling | Tailwind CSS + shadcn/ui | 4.x |
| Roteamento | react-router-dom | 7.x |
| Backend / Banco | Supabase (PostgreSQL) | Latest |
| Auth | Supabase Auth | Built-in |
| Storage | Supabase Storage | Built-in |
| Forms | react-hook-form + Zod | Latest |
| Data Fetching | @tanstack/react-query | Latest |
| Icons | lucide-react | Latest |
| Dates | date-fns | Latest |

---

## 3. Estrutura de Pastas

```
escola-infantil-saas/
├── app/
│   └── globals.css              # Variáveis CSS do tema (teal/coral/cream)
├── src/
│   ├── main.tsx                 # Entry point React
│   ├── App.tsx                  # Router + QueryClientProvider
│   ├── index.css                # Tailwind imports
│   ├── lib/
│   │   ├── supabase.ts          # Cliente Supabase tipado
│   │   ├── auth.ts              # signIn, signUp, signOut, resetPassword
│   │   ├── rbac.ts              # Funções de verificação de permissão
│   │   └── utils.ts             # cn(), formatCPF, formatPhone, formatDate
│   ├── types/
│   │   ├── database.ts          # Interfaces TypeScript do schema
│   │   └── roles.ts             # Enum de roles e dashboards por role
│   ├── hooks/
│   │   └── useAuth.ts           # Hook de sessão + perfil do usuário
│   ├── components/
│   │   ├── ui/                  # Componentes shadcn (button, input, etc.)
│   │   ├── layout/
│   │   │   ├── PublicLayout.tsx     # Navbar + Footer do site público
│   │   │   ├── AuthLayout.tsx       # Layout centralizado para login/cadastro
│   │   │   ├── AdminLayout.tsx      # Sidebar + header do admin
│   │   │   ├── TeacherLayout.tsx    # Sidebar simplificada do professor
│   │   │   └── ParentLayout.tsx     # Sidebar do portal dos pais
│   │   └── shared/
│   │       ├── ProtectedRoute.tsx   # Guard de rota com verificação de role
│   │       └── LoadingSpinner.tsx   # Spinner reutilizável
│   └── pages/
│       ├── public/              # 10 páginas do site público
│       ├── auth/                # Login, Signup, ForgotPassword
│       ├── admin/               # Dashboard admin (expansível)
│       ├── teacher/             # Dashboard professor (expansível)
│       └── parent/              # Dashboard pais (expansível)
├── supabase/
│   └── schema.sql               # Schema completo + RLS + triggers + storage policies
├── .env.example                 # Template de variáveis de ambiente
├── package.json                 # Dependências e scripts
├── vite.config.ts               # Configuração Vite + path aliases
├── tsconfig.json                # Configuração TypeScript
├── postcss.config.mjs           # Configuração PostCSS/Tailwind
├── components.json              # Configuração shadcn/ui
└── index.html                   # HTML entry point
```

---

## 4. Design System

### Paleta de Cores

Tema quente teal + coral + cream. Profissional e acolhedor para escola infantil. Sem roxo/índigo.

| Token | Cor | Uso |
|-------|-----|-----|
| Primary | `#0D9488` (teal-600) | Botões primários, links, estados ativos |
| Secondary | `#F97316` (orange-500) | CTAs, destaques, badges |
| Accent | `#0EA5E9` (sky-500) | Info badges, ações secundárias |
| Background | `#FFFBF5` (warm cream) | Fundo das páginas |
| Surface | `#FFFFFF` | Cards, painéis |
| Text | `#1C1917` (stone-900) | Texto principal |
| Muted | `#78716C` (stone-500) | Texto secundário |

As cores são definidas como variáveis CSS oklch em `app/globals.css`, sobrescrevendo os defaults do shadcn/ui.

---

## 5. Autenticação e RBAC

### Fluxo de Autenticação

1. Usuário acessa `/entrar` ou `/cadastrar`
2. Supabase Auth gerencia sessão JWT
3. Trigger `on_auth_user_created` cria registro em `profiles` automaticamente
4. Hook `useAuth()` escuta mudanças de sessão e carrega perfil
5. `ProtectedRoute` verifica sessão + role antes de renderizar rotas protegidas

### Roles e Permissões

| Role | Acesso |
|------|--------|
| `admin` | Tudo: CRUD completo, aprovação de matrículas, gestão de usuários, relatórios |
| `teacher` | Turmas atribuídas, lançamento de notas/frequência, mensagens |
| `parent` | Visualizar filhos, notas, boletins, mensagens, frequência |

### Arquivos Chave

- `src/lib/auth.ts` — Funções de autenticação
- `src/lib/rbac.ts` — Verificações de permissão por role
- `src/hooks/useAuth.ts` — Estado global de autenticação
- `src/components/shared/ProtectedRoute.tsx` — Guard de rota

---

## 6. Schema do Banco de Dados

### Tabelas

| Tabela | Descrição | Tenant Isolation |
|--------|-----------|-----------------|
| `schools` | Tenants/escolas | Base de isolamento |
| `profiles` | Extensão de auth.users com role e school_id | school_id |
| `students` | Alunos matriculados | school_id + parent_guardian_id |
| `classes` | Turmas com professor atribuído | school_id + teacher_id |
| `class_students` | Relação turma-aluno | school_id |
| `subjects` | Disciplinas | school_id |
| `grades` | Notas individuais | school_id + teacher_id + student scope |
| `report_cards` | Boletins gerados | school_id + student scope |
| `enrollments` | Solicitações de matrícula/rematrícula | school_id (INSERT público) |
| `staff` | Funcionários administrativos | school_id |
| `attendance` | Frequência diária | school_id + class scope |
| `messages` | Mensagens entre usuários | school_id + sender/recipient |

### Enums

- `app_role`: admin | teacher | parent
- `enrollment_status`: pending | approved | rejected | active | inactive
- `grade_type`: avaliacao | trabalho | prova | participacao | final
- `attendance_status`: presente | ausente | justificado | atraso
- `message_status`: sent | read | archived

### Indexes

Indexes criados em todas as chaves estrangeiras e campos de busca frequente para performance otimizada.

---

## 7. Row Level Security (RLS)

### Princípios de Segurança

1. **RLS habilitado em TODAS as tabelas** — sem exceção
2. **Funções helper SECURITY DEFINER** com `search_path` fixo para prevenir privilege escalation
3. **Nunca expor SERVICE_ROLE_KEY no frontend** — apenas ANON_KEY
4. **Tenant isolation via school_id** em todas as queries
5. **Storage buckets privados** com estrutura de pastas `{school_id}/{entity_id}/file`

### Políticas por Tabela

| Tabela | Admin | Teacher | Parent | Público |
|--------|-------|---------|--------|---------|
| schools | SELECT own | SELECT own | SELECT own | — |
| profiles | SELECT all in school, INSERT | SELECT teachers+parents | SELECT own | — |
| students | Full CRUD | SELECT own classes | SELECT own children | — |
| classes | Full CRUD | SELECT own | SELECT children's | — |
| grades | Full CRUD | INSERT/UPDATE own classes | SELECT own children | — |
| enrollments | SELECT/UPDATE/DELETE | — | SELECT own by email | INSERT |
| attendance | Full CRUD | Manage own classes | SELECT own children | — |
| messages | SELECT all (moderação) | Send/read own | Send/read own | — |
| report_cards | Full CRUD | SELECT own classes | SELECT own children | — |

### Storage Buckets

| Bucket | Visibilidade | Regras |
|--------|-------------|--------|
| avatars | Público | Leitura livre, escrita apenas pelo próprio usuário |
| enrollment-docs | Privado | INSERT público em `/pending/`, admin lê por school_id |
| report-cards | Privado | Admin gerencia, teacher/parent leem escopado |
| student-photos | Privado | Admin gerencia, teacher/parent leem escopado |

### Funções Helper de Segurança

```sql
get_user_school_id()  -- Retorna school_id do usuário autenticado
get_user_role()       -- Retorna role do usuário autenticado
is_admin()            -- Boolean: usuário é admin?
is_teacher()          -- Boolean: usuário é teacher?
is_parent()           -- Boolean: usuário é parent?
is_teacher_of_class(class_id)  -- Professor é responsável pela turma?
is_parent_of_student(student_id) -- Usuário é pai/mãe do aluno?
```

Todas são `SECURITY DEFINER` com `SET search_path = public` para prevenir SQL injection via schema manipulation.

---

## 8. Rotas da Aplicação

### Site Público (sem autenticação)

| Rota | Página |
|------|--------|
| `/` | Home com hero, features, CTA |
| `/sobre` | História, missão, visão, valores |
| `/metodologia` | Metodologias pedagógicas, BNCC |
| `/equipe` | Lista de professores e staff |
| `/galeria` | Grid de fotos da escola |
| `/depoimentos` | Depoimentos de famílias |
| `/faq` | Accordion de perguntas frequentes |
| `/contato` | Formulário de contato + informações |
| `/matricula` | Formulário multi-step de matrícula |
| `/rematricula` | Formulário de rematrícula |

### Autenticação

| Rota | Página |
|------|--------|
| `/entrar` | Login com email/senha |
| `/cadastrar` | Cadastro (parent/teacher) |
| `/recuperar-senha` | Recuperação de senha por email |

### Painel Admin (role: admin)

| Rota | Página |
|------|--------|
| `/admin` | Dashboard com KPIs |
| `/admin/alunos` | CRUD de alunos *(TODO)* |
| `/admin/professores` | CRUD de professores *(TODO)* |
| `/admin/turmas` | Gestão de turmas *(TODO)* |
| `/admin/notas` | Gestão de notas *(TODO)* |
| `/admin/matriculas` | Aprovação de matrículas *(TODO)* |
| `/admin/usuarios` | Gestão de usuários *(TODO)* |

### Portal Professor (role: teacher, admin)

| Rota | Página |
|------|--------|
| `/professor` | Dashboard do professor |
| `/professor/turmas` | Minhas turmas *(TODO)* |
| `/professor/notas` | Lançar notas *(TODO)* |
| `/professor/frequencia` | Registrar frequência *(TODO)* |

### Portal Pais (role: parent, admin)

| Rota | Página |
|------|--------|
| `/pais` | Dashboard dos pais |
| `/pais/filhos` | Meus filhos *(TODO)* |
| `/pais/notas` | Notas dos filhos *(TODO)* |
| `/pais/boletins` | Boletins escolares *(TODO)* |
| `/pais/mensagens` | Mensagens com professores *(TODO)* |

---

## 9. Setup e Desenvolvimento

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- IDE (Google Antigravity, VS Code, Cursor, etc.)

### Instalação

```bash
cd escola-infantil-saas
npm install
```

### Configuração do Ambiente

1. Copie o template de variáveis:
```bash
cp .env.example .env
```

2. Preencha `.env` com credenciais do Supabase:
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

> ⚠️ **NUNCA** use a `SERVICE_ROLE_KEY` no `.env` do frontend. Ela ignora RLS e deve ser usada apenas em Edge Functions ou backend.

### Executar Schema no Supabase

1. Acesse o Supabase Dashboard → SQL Editor
2. Cole o conteúdo completo de `supabase/schema.sql`
3. Execute o script
4. Verifique que todas as tabelas, políticas RLS, triggers e storage buckets foram criados

### Desenvolvimento Local

```bash
npm run dev
```

Acesse `http://localhost:5173`

### Build de Produção

```bash
npm run build
npm run preview
```

---

## 10. Próximos Passos (Roadmap)

### Fase 3: Admin Core
- [ ] CRUD completo de alunos
- [ ] CRUD de professores
- [ ] Gestão de turmas e roster
- [ ] Workflow de aprovação de matrículas
- [ ] Gestão de usuários e roles

### Fase 4: Funcionalidades Acadêmicas
- [ ] Gestão de disciplinas
- [ ] Lançamento de notas (professor + override admin)
- [ ] Cálculo de médias
- [ ] Geração de boletins (PDF)
- [ ] Registro de frequência

### Fase 5: Portal dos Pais + Polish
- [ ] Lista de filhos com detalhes
- [ ] Visualização de notas por disciplina/período
- [ ] Download de boletins
- [ ] Sistema de mensagens pai ↔ professor
- [ ] Notificações in-app
- [ ] Auditoria de responsividade mobile
- [ ] Otimização de performance (lazy loading, query caching)

---

## 11. Notas de Segurança

| Regra | Detalhe |
|-------|---------|
| ANON_KEY apenas no frontend | A ANON_KEY respeita RLS. Segura para uso no browser. |
| SERVICE_ROLE_KEY nunca no frontend | Ignora RLS completamente. Use apenas em Edge Functions. |
| Funções SECURITY DEFINER com search_path fixo | Previne privilege escalation via schema injection. |
| Enrollment INSERT público com rate limiting recomendado | Formulário de matrícula não exige auth. Adicione rate limiting em produção. |
| Storage folders estruturados por school_id | Garante tenant isolation mesmo em buckets compartilhados. |
| CPF com constraint UNIQUE por escola | Previne duplicação de registros dentro do mesmo tenant. |
| Senhas gerenciadas pelo Supabase Auth | Nunca armazene senhas nas tabelas da aplicação. |

---

## 12. Referências

- [Supabase Docs](https://supabase.com/docs)
- [Supabase RLS Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [React Router v7](https://reactrouter.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Zod Validation](https://zod.dev/)
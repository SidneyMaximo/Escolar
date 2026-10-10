# 🏫 Escola Infantil SaaS — Sistema de Gestão Escolar e Portal Interativo

> Plataforma completa de Gestão Escolar e Portal Web para Educação Infantil, desenvolvida em arquitetura moderna com **React 19**, **Vite**, **TypeScript**, **TailwindCSS** e **Supabase**.

---

## 📌 Sumário
- [Visão Geral](#-visão-geral)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura e Perfis de Acesso (RBAC)](#-arquitetura-e-perfis-de-acesso-rbac)
- [Módulos do Sistema](#-módulos-do-sistema)
  - [1. Portal Público & Matrícula Online](#1-portal-público--matrícula-online)
  - [2. Painel Administrativo](#2-painel-administrativo)
  - [3. Portal do Professor](#3-portal-do-professor)
  - [4. Portal dos Pais e Responsáveis](#4-portal-dos-pais-e-responsáveis)
- [Personalização Dinâmica do Site (CMS)](#-personalização-dinâmica-do-site-cms)
- [Geração e Impressão de Matrículas em PDF](#-geração-e-impressão-de-matrículas-em-pdf)
- [Controle e Liberação de Usuários](#-controle-e-liberação-de-usuários)
- [Estrutura de Migrações do Supabase](#-estrutura-de-migrações-do-supabase)
- [Instalação e Execução Local](#-instalação-e-execução-local)
- [Segurança & Boas Práticas](#-segurança--boas-práticas)

---

## 🌟 Visão Geral

O **Escola Infantil SaaS** é uma solução completa projetada para atender escolas de educação infantil, creches e maternal, conectando a direção escolar, professores e famílias de forma transparente e segura. 

A aplicação funciona tanto conectada ao banco de dados em nuvem do **Supabase** quanto em **modo de demonstração comercial offline**, permitindo apresentações de vendas fluidas com persistência reativa local.

---

## 🛠 Tecnologias Utilizadas

- **Frontend Core:** React 19, TypeScript, Vite
- **Roteamento:** React Router DOM (v7)
- **Estilização:** TailwindCSS v4, CSS Variables, Design Tokens adaptativos, `@media print` otimizado para formato A4
- **Ícones & UI:** Lucide React, Radix/Base-UI
- **Gerenciamento de Estado de Dados:** React Query (@tanstack/react-query)
- **Backend as a Service:** Supabase (Auth, PostgreSQL, Row Level Security - RLS)

---

## 👥 Arquitetura e Perfis de Acesso (RBAC)

O sistema conta com proteção de rotas hierárquica implementada em [`ProtectedRoute.tsx`](src/components/shared/ProtectedRoute.tsx):

| Perfil | Nível de Acesso | Rota Base | Descrição |
| :--- | :--- | :--- | :--- |
| **Administrador** | Irrestrito | `/admin` | Controle de turmas, alunos, professores, aprovação de matrículas, liberação de usuários e personalização do site. |
| **Professor** | Pedagógico | `/professor` | Gestão das turmas sob sua responsabilidade, lançamento de notas, chamada diária de frequência e publicação de projetos. |
| **Pai / Responsável** | Familiar | `/pais` | Acesso estrito às informações de seus filhos, boletins, diários de classe e galeria de projetos da turma. |

---

## 📦 Módulos do Sistema

### 1. Portal Público & Matrícula Online
- **Páginas Institucionais:** Home (com Hero Dinâmica), Sobre Nós, Metodologia (alinhada à BNCC), Equipe de Educadores, Galeria de Fotos dos Espaços, Depoimentos, FAQ e Fale Conosco.
- **Matrícula Online (`/matricula`):** Fluxo guiado em 4 etapas (Dados do Aluno, Dados do Responsável, Documentos solicitados e Revisão geral com aceite de termos LGPD).
- **Emissão Imediata de Ficha em PDF:** Ao submeter a pré-matrícula, o responsável tem acesso imediato ao botão de download/impressão da **Ficha Oficial de Requerimento**.

### 2. Painel Administrativo
- **Dashboard (`/admin`):** Indicadores em tempo real de matrículas, alunos e corpo docente.
- **Gerenciamento de Matrículas (`/admin/matriculas`):** Análise de pedidos, aprovação (que já cadastra o aluno automaticamente), recusa com justificativa e **botão de emissão de Ficha Oficial em PDF**.
- **Liberação de Usuários (`/admin/usuarios`):** Controle de acessos com aprovação/liberação de novos cadastros, bloqueio temporário, reativação e troca de cargos.
- **Corpo Docente (`/admin/professores`):** Cadastro de educadores com nome completo, **e-mail institucional de acesso**, telefone e atribuição da **turma sob sua responsabilidade**.
- **Turmas & Alunos (`/admin/turmas`, `/admin/alunos`):** Gestão de salas de aula, capacidade máxima e alunos vinculados.
- **Configurações do Site CMS (`/admin/configuracoes`):** Painel de alteração de todas as mídias e textos públicos do site com efeito reativo instantâneo.

### 3. Portal do Professor
- Gestão das turmas atribuídas.
- Controle de frequência e presença diária.
- Registro de avaliações, pareceres descritivos e notas.
- **Projetos Pedagógicos:** Envio de atividades, fotos de murais e oficinas pedagógicas para visualização dos pais.

### 4. Portal dos Pais e Responsáveis
- Acompanhamento do desenvolvimento pedagógico dos filhos.
- Consulta ao boletim escolar e pareceres.
- Mural de fotos de atividades e mensagens com a escola.

---

## 🎨 Personalização Dinâmica do Site (CMS)

A rota [`/admin/configuracoes`](src/pages/admin/Settings.tsx) permite à escola alterar sua identidade visual sem tocar em código:
- **Home / Hero:** Troca da foto de fundo do banner (arquivos locais da pasta `public/` ou URLs externas), slogans e textos de destaque com prévia instantânea.
- **Sobre Nós:** Título, história da escola, missão, visão e valores.
- **Metodologia:** Inclusão, edição e exclusão de pilares pedagógicos.
- **Equipe:** Adição de educadores com fotos, cargos e biografias.
- **Galeria:** Adição de novas fotos de salas de aula e parquinhos com legendas.
- **Dados da Escola & Contato:** Alteração de Nome, CNPJ, Telefone Principal, WhatsApp, E-mail Geral, E-mail de Matrículas, Endereço Completo e Horários de Funcionamento (refletidos imediatamente no Cabeçalho, Rodapé e Fale Conosco).

---

## 📄 Geração e Impressão de Matrículas em PDF

O componente [`EnrollmentPrintModal.tsx`](src/components/enrollment/EnrollmentPrintModal.tsx) gera documentos oficiais no padrão de secretarias escolares:
1. **Cabeçalho Timbrado:** Dados oficiais da instituição e protocolo único (ex: `MAT-2026-XXXX`).
2. **Quadro 1:** Identificação completa da criança, data de nascimento e observações de saúde/alergias.
3. **Quadro 2:** Dados cadastrais do responsável legal, CPF, contatos e endereço.
4. **Quadro 3:** Termo de consentimento e conformidade com a LGPD (Lei nº 13.709/2018).
5. **Quadro 4:** Linhas de assinatura formal do responsável e carimbo da secretaria.
6. **Formato `@media print`:** Estilizado para folha A4 retrato, ocultando barras e navegadores no momento de imprimir ou salvar em PDF.

---

## 🔐 Controle e Liberação de Usuários

Para proteger dados sensíveis de menores de idade, novos cadastros criados em `/cadastrar` entram com status `pending`:
1. O usuário pendente que tenta fazer login visualiza a tela **"Aguardando Liberação do Acesso"**.
2. O Administrador acessa `/admin/usuarios` e visualiza o contador de alertas em destaque.
3. Com o botão **"✓ Aceitar / Liberar"**, o acesso é ativado imediatamente.
4. O Administrador pode a qualquer momento **Bloquear** ou **Reativar** qualquer conta.

---

## 🗄️ Estrutura de Migrações do Supabase

Os scripts SQL estão organizados na pasta [`supabase/`](supabase/):

1. [`schema.sql`](supabase/schema.sql): Estrutura base de tabelas, enums e políticas RLS.
2. [`create-admin.sql`](supabase/create-admin.sql): Criação do usuário administrador inicial (`Admin@diretor` / `Diretor`).
3. [`site_content_migration.sql`](supabase/site_content_migration.sql): Tabela de conteúdo dinâmico do CMS público.
4. [`enrollments_migration.sql`](supabase/enrollments_migration.sql): Tabela de matrículas e políticas públicas de inserção.
5. [`teachers_migration.sql`](supabase/teachers_migration.sql): Colunas de e-mail institucional e turma responsável para educadores.
6. [`users_approval_migration.sql`](supabase/users_approval_migration.sql): Coluna de status e políticas de liberação de usuários.
7. [`student_projects_migration.sql`](supabase/student_projects_migration.sql): Compartilhamento de fotos e projetos entre professores e pais.

---

## 🚀 Instalação e Execução Local

### Pré-requisitos
- Node.js 18+ instalado
- Gerenciador de pacotes npm

### Passos de Instalação

```bash
# 1. Clonar o repositório
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

# 2. Entrar na pasta do projeto
cd escola-infantil-saas

# 3. Instalar dependências
npm install

# 4. Configurar variáveis de ambiente
# Crie um arquivo .env na raiz com as chaves do seu Supabase:
# VITE_SUPABASE_URL=https://sua-url.supabase.co
# VITE_SUPABASE_ANON_KEY=sua-anon-key

# 5. Iniciar o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173/`.

### Credenciais Padrão de Demonstração
- **Painel Administrativo:** `Admin@diretor` | Senha: `Diretor`
- **Painel do Professor:** `juliana.mendes@escola.com.br` | Senha: `Professor123`

---

## 🛡️ Segurança & Boas Práticas

- **Princípio do Menor Privilégio:** Apenas a chave pública anônima (`VITE_SUPABASE_ANON_KEY`) é exposta ao navegador.
- **Proteção de Variáveis:** O arquivo `.gitignore` inclui `.env`, `.env.local` e credenciais confidenciais.
- **Isolamento de Alunos:** O portal dos pais restringe as consultas estritamente aos filhos vinculados ao ID do responsável (`parent_guardian_id`).
- **Validação e Tipagem Estrita:** Tipos TypeScript integrados em 100% dos modelos de dados do banco.

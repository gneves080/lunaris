# Lunaris Gestão

Aplicação web de gestão para pequenos negócios de biscoitos artesanais, desenvolvida em React + TypeScript + Vite com foco em gestão operacional, financeira e de produção.

## Objetivo

Centralizar os processos essenciais de um negócio artesanal em um único ambiente: produtos, clientes, pedidos, estoque, produção, financeiro, relatórios e configurações.

## Funcionalidades implementadas

- Dashboard com visão geral do negócio
- Gestão de produtos, clientes e pedidos
- Controle de estoque e movimentações
- Painel financeiro com resumo de receitas e despesas
- Relatórios exportáveis em CSV
- Página de configurações com dados do negócio
- Proteção de rotas por login local em ambiente de desenvolvimento

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Supabase
- PostgreSQL
- React Hook Form
- Zod
- Recharts
- Lucide React
- date-fns
- Vitest
- React Testing Library
- ESLint/Oxlint
- Vercel

## Requisitos

- Node.js 20+
- npm 10+
- Conta Supabase
- Conta Vercel
- Git

## Instalação

```bash
npm install
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha a chave pública do projeto:

```env
VITE_SUPABASE_URL=https://ypkyqeziypcdlvmwzqag.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica
```

O Project URL não é uma credencial. A chave `anon`/publishable é própria para o frontend somente com RLS habilitado. Nunca use a chave `service_role` em variáveis `VITE_*`, no navegador ou no Git.

## Configuração do Supabase

1. Abra o projeto `ypkyqeziypcdlvmwzqag` no painel Supabase e confirme que é o projeto certo.
2. Em `SQL Editor`, abra `supabase/migrations/202610240001_initial_schema.sql`, copie o conteúdo completo, execute e confirme a criação das tabelas e políticas.
3. Em `Authentication > Users`, crie o usuário proprietário com o e-mail que será usado no login e confirme o usuário.
4. Copie o UUID desse usuário. No SQL Editor, execute o bloco abaixo substituindo `UUID_DO_USUARIO` pelo UUID real. Não coloque UUIDs de usuários no repositório público:

```sql
with new_business as (
  insert into public.businesses (name, phone, email)
  values ('Lunaris Cookies', '', '')
  returning id
)
insert into public.profiles (user_id, business_id, role)
select 'UUID_DO_USUARIO'::uuid, id, 'owner'
from new_business;
```

5. Em `Project Settings > API`, copie a chave `anon`/publishable para `VITE_SUPABASE_ANON_KEY` no `.env` local. Reinicie `npm run dev` e entre com o usuário criado em Authentication.
6. Na Vercel, abra o projeto, vá em `Settings > Environment Variables` e cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` para Production (e Preview, se necessário). Salve e faça um novo deploy para as variáveis entrarem no bundle do Vite.

## Migrations e banco

O esquema inicial e as políticas RLS estão em `supabase/migrations/202610240001_initial_schema.sql`. As tabelas de negócio isolam os dados por `business_id`; o usuário autenticado só vê os registros do negócio associado ao seu perfil. Com o Supabase configurado, o app carrega e salva produtos, clientes, pedidos/itens, estoque e configurações no banco.

**Importante:** a URL sozinha não autoriza executar SQL. A migration precisa ser aplicada por alguém autenticado no painel Supabase ou pelo Supabase CLI autorizado. O login usa Supabase Auth quando as variáveis estão configuradas; sem elas, o app continua no modo local de demonstração. Dados que já estavam em `localStorage` não são importados automaticamente; exporte-os antes de ativar o banco para preservar esses registros.

## Execução local

```bash
npm run dev
```

A aplicação será aberta em `http://localhost:5173`.

## Testes

```bash
npm run test
```

## Build

```bash
npm run build
```

## Deploy na Vercel

1. Conecte o repositório à Vercel.
2. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em `Settings > Environment Variables`.
3. Faça um novo deploy sempre que adicionar ou alterar variáveis `VITE_*`, pois elas são incorporadas no build do Vite.
4. O fallback para rotas internas já está definido em `vercel.json`.
5. Verifique o login e a leitura/gravação dos registros no domínio publicado.

## Estrutura do projeto

```text
src/
  components/
  hooks/
  lib/
  pages/
  schemas/
  test/
  types/
  utils/
```

## Limitações conhecidas

- A migration precisa ter sido aplicada ao Supabase e o perfil da conta proprietária associado ao negócio.
- As variáveis do Supabase precisam estar cadastradas na Vercel e um novo deploy precisa ser concluído para ativar o banco em produção.
- Os dados antigos guardados no navegador não são importados automaticamente.

## Próximos passos recomendados

1. Criar as migrações SQL no Supabase.
2. Configurar RLS e permissões por negócio.
3. Conectar autenticação real com Supabase Auth.
4. Implementar upload de imagens em Storage.
5. Validar fluxos reais de pedidos, estoque e financeiro com dados reais.
6. Publicar a aplicação na Vercel após confirmar as variáveis de ambiente.

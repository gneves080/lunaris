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

Crie um arquivo `.env` com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica
```

Exemplo disponível em `.env.example`.

## Configuração do Supabase

1. Crie um projeto no Supabase.
2. Gere a URL do projeto e a chave anônima.
3. Ative `Authentication` com email/senha.
4. Crie as tabelas e políticas RLS necessárias para `profiles`, `products`, `customers`, `orders`, `inventory`, etc.
5. Configure Storage para imagens de produtos, se necessário.

## Migrations e banco

Este projeto inclui a estrutura inicial do front-end e utilitários, mas as migrações SQL e as políticas RLS ainda precisam ser aplicadas em um banco real do Supabase.

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
2. Configure as variáveis de ambiente do projeto.
3. Aplique o build com Vite.
4. Garanta que o projeto usa fallback de roteamento para rotas internas.
5. Verifique a aplicação publicada com o domínio gerado pela Vercel.

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

- O ambiente atual não contém credenciais reais do Supabase.
- As migrações e políticas de banco ainda precisam ser criadas no projeto Supabase real.
- A autenticação real do Supabase ainda não foi conectada em produção.
- O fluxo de dados foi implementado com persistência local para permitir desenvolvimento e validação do front-end antes do ajuste final ao banco real.

## Próximos passos recomendados

1. Criar as migrações SQL no Supabase.
2. Configurar RLS e permissões por negócio.
3. Conectar autenticação real com Supabase Auth.
4. Implementar upload de imagens em Storage.
5. Validar fluxos reais de pedidos, estoque e financeiro com dados reais.
6. Publicar a aplicação na Vercel após confirmar as variáveis de ambiente.

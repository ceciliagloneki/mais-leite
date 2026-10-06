# +Leite — Banco de Leite Humano de Marília

Painel administrativo do Banco de Leite Humano de Marília. Front-end em Next.js
(App Router) para gestão de doadoras, coletas, processamento, distribuição e
demais áreas operacionais.

## Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [React 18](https://react.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) com design tokens (HSL)
- [TanStack Query](https://tanstack.com/query) para dados assíncronos
- [lucide-react](https://lucide.dev/) para ícones
- [Vitest](https://vitest.dev/) + Testing Library para testes

## Pré-requisitos

- Node.js 20+ (veja `.nvmrc`)
- npm 10+

## Como rodar

```bash
npm install
cp .env.example .env.local   # ajuste a URL da API se necessário
npm run dev                  # http://localhost:3000
```

> Importante: `npm run dev` é um processo contínuo — rode no seu terminal, não
> dentro de automações.

## Scripts

| Comando          | Descrição                             |
| ---------------- | ------------------------------------- |
| `npm run dev`    | Servidor de desenvolvimento           |
| `npm run build`  | Build de produção                     |
| `npm run start`  | Sobe o build de produção              |
| `npm run lint`   | Lint com ESLint (next lint)           |
| `npm run test`   | Testes (Vitest, execução única)       |

## Estrutura de pastas

```
app/
  (dashboard)/            Grupo de rotas com o Sidebar fixo
    layout.tsx            Layout compartilhado (Sidebar + área de conteúdo)
    dashboard/            Página inicial do painel
    doadoras/             Área de doadoras (referência de implementação)
  layout.tsx              Layout raiz (html/body + Providers)
  page.tsx                Redireciona "/" para "/dashboard"
  providers.tsx           QueryClientProvider (TanStack Query)
  globals.css             Design tokens (CSS variables) + base
components/               Componentes de UI reutilizáveis
  Sidebar.tsx             Navegação lateral fixa
  PlaceholderPage.tsx     Base para áreas em construção
hooks/                    Hooks de dados (ex.: use-doadoras)
lib/                      Lógica pura e configuração
  navigation.ts           Fonte única dos itens do menu lateral
services/                 Acesso à API (fetch + mapeamento)
types/                    Tipos de domínio compartilhados
```

## Convenções

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para o fluxo de trabalho, padrões de
código e como adicionar uma nova página ao painel.
# Mais-Leite

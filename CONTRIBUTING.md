# Guia de contribuição

Este documento padroniza como trabalhamos no projeto para que várias pessoas
mexam em páginas diferentes sem conflito.

## Fluxo de trabalho (Git)

1. Atualize a `main`: `git pull origin main`
2. Crie uma branch por tarefa/área:
   - `feat/coleta-domiciliar`
   - `fix/doadoras-filtro`
3. Faça commits pequenos e descritivos (português):
   - `feat: lista de coletas domiciliares`
   - `fix: corrige contagem de doadoras ativas`
4. Rode `npm run lint` e `npm run test` antes de abrir o PR.
5. Abra um Pull Request para a `main` e peça revisão.

Não faça push direto na `main`.

## Padrões de código

- TypeScript em todo lugar. Evite `any`.
- Componentes de UI em `components/`, um arquivo por componente, export nomeado
  + `default`.
- Lógica pura e sem React em `lib/`. Acesso à API em `services/`. Tipos de
  domínio em `types/`.
- Dados assíncronos sempre via hook em `hooks/` usando TanStack Query — a página
  nunca chama `fetch()` nem importa o service diretamente.
- Estilização só com classes Tailwind usando os tokens do tema (`bg-surface`,
  `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`...).
  Não use cores hex fixas.
- Ícones via `lucide-react`.

## Design tokens

As cores vivem como CSS variables em `app/globals.css` e são expostas no
`tailwind.config.ts`. Principais:

- `background` / `foreground` — fundo creme do app e texto
- `surface` — superfície branca de cards e tabelas
- `primary` — acento coral (CTAs)
- `muted` / `muted-foreground` — áreas e textos secundários
- `success` / `warning` / `danger` — estados
- `sidebar*` — cores da navegação lateral

## Organização de rotas (por que o grupo `(dashboard)`)

Usamos **route groups** do Next.js App Router — pastas entre parênteses como
`(dashboard)`. Elas **não aparecem na URL**: servem só para agrupar páginas que
compartilham o mesmo layout.

```
app/
  (dashboard)/          Área logada — layout COM Sidebar fixo
    layout.tsx          Aplica o Sidebar a tudo que está dentro
    dashboard/          -> /dashboard
    doadoras/           -> /doadoras
    processamento/      -> /processamento
  layout.tsx            Layout raiz (html/body + Providers)
  page.tsx              "/" redireciona para "/dashboard"
```

Benefícios:

- Toda página criada dentro de `(dashboard)/` herda o Sidebar automaticamente,
  sem repetir código.
- As URLs ficam limpas (`/doadoras`, não `/dashboard/doadoras`).
- Dá para adicionar outros grupos no futuro com layout próprio (ex.: `(auth)/`
  para login/cadastro, sem Sidebar).

### Por que `/` redireciona para `/dashboard`

Optamos por manter **todas as seções como rotas nomeadas e explícitas**
(`/dashboard`, `/doadoras`, ...) e fazer a raiz `/` apenas redirecionar para
`/dashboard` (ver `app/page.tsx`).

Motivo: em painéis administrativos com muitas áreas, tratar o dashboard como
"só mais uma seção" (e não como um caso especial na raiz) deixa a estrutura mais
consistente e previsível para a equipe — cada área tem uma URL concreta que
aparece em links, histórico e favoritos. É o padrão adotado por ferramentas como
GitHub, Linear e Vercel.

> Dica: ao rodar `npm run dev`, se a porta 3000 estiver ocupada o Next sobe em
> 3001 (`http://localhost:3001`). Confira a porta indicada no terminal.

## Como adicionar uma nova página

Todas as páginas do painel ficam dentro de `app/(dashboard)/` e herdam o
Sidebar fixo automaticamente.

1. Crie a pasta e a página, ex.: `app/(dashboard)/processamento/page.tsx`.
2. Comece pelo placeholder padronizado:

   ```tsx
   import { PlaceholderPage } from "@/components/PlaceholderPage";

   export default function ProcessamentoPage() {
     return <PlaceholderPage title="Processamento" />;
   }
   ```

3. Garanta que o item existe no menu em `lib/navigation.ts` (o `href` precisa
   bater com a rota da pasta). O Sidebar marca o item ativo sozinho.
4. Siga a área de **Doadoras** (`app/(dashboard)/doadoras/`) como referência de
   página completa: hook de dados, estados de loading/erro/vazio e componentes.

## Testes

- Vitest + Testing Library. Coloque os testes ao lado do que testam ou em
  `__tests__`.
- Rode com `npm run test` (execução única).

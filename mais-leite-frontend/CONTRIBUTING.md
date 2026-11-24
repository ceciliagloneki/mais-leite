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
4. Rode `npm run format` e `npm run typecheck` antes de abrir o PR.
5. Abra um Pull Request para a `main` e peça revisão.

Não faça push direto na `main`.

## Padrões de código

- TypeScript em todo lugar. Evite `any`.
- Componentes de UI em `components/`, um arquivo por componente, export nomeado
  - `default`.
- Lógica pura e sem React em `lib/`. Acesso à API em `services/`. Tipos de
  domínio em `types/`.
- Dados assíncronos sempre via hook em `hooks/` usando TanStack Query — a página
  nunca chama `fetch()` nem importa o service diretamente.
- Estilização só com classes Tailwind usando os tokens do tema (`bg-surface`,
  `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`...).
  Não use cores hex fixas (exceções: o logo e os documentos impressos, que usam a paleta da marca em `components/Logo.tsx`).
- Sem comentários no código: nomes claros de variáveis, funções e componentes explicam o que o código faz.
- Ícones via `lucide-react`.

## Design tokens

As cores vivem como CSS variables em `app/globals.css` e são expostas no
`tailwind.config.ts`. Principais:

- `background` / `foreground` — fundo creme do app e texto
- `surface` — superfície branca de cards e tabelas
- `primary` — verde-azulado (botões e item ativo)
- `brand` — coral da marca (logo)
- `muted` / `muted-foreground` — áreas e textos secundários
- `success` / `warning` / `danger` / `info` — estados (verde = ok, amarelo = aguardando, vermelho = problema)
- `sidebar*` — cores da navegação lateral

## Padrão de tela (UX)

O sistema é usado por pessoas de 40–50 anos: tudo precisa ser grande, claro e
igual em todas as telas.

1. `PageHeader` com o título e **um** botão principal (`acao`) no formato "+ Novo …" / "+ Nova …", com o ícone `Plus`.
2. Listagem: `Card tabela` com a busca e os filtros no `filtros` do card, e `DataTable` dentro. Use as células comuns
   (`Codigo`, `Numero`, `TextoDuplo`, `TextoApoio`); linhas clicáveis usam `aoClicar` (a seta aparece sozinha).
3. Formulários curtos abrem em `FormModal`; confirmações em `ConfirmarModal`; impressões em `ImpressaoModal`.
   Tamanhos de modal: `sm` confirmação, `md` formulário, `lg` formulário com lista ou detalhe.
   `FormCard` fica só para formulários de página inteira (nova doadora, triagem).
4. Dados que o sistema já conhece não são digitados de novo: calcule (ex.: tipo de leite pela data do parto) e mostre com `ValorFixo`.
5. Telas com várias etapas usam `Abas`. Ações de uma linha ficam na própria linha, com o botão `pequeno`.
6. Datas do dia já vêm preenchidas (`hoje()`, `agora()` em `lib/format.ts`). Regras de zona e tipo de leite ficam em `lib/regras.ts`.
7. Perguntas que mudam o resultado (conforme/não conforme) usam `SimNao`, não checkbox.
8. Botões sempre com texto (`Botao`), nunca só ícone. `Aviso` explica a regra ou o próximo passo.

Componentes comuns: `Botao` (Button.tsx), `Card`, `DataTable` + células (DataTable.tsx), `Modal`/`ImpressaoModal` (Modal.tsx),
`FormModal`/`ConfirmarModal` (FormModal.tsx), `FormCard`, `Campo`/`Selecao`/`ValorFixo`/`Marcar`/`SimNao`/`ListaMarcar`/`Grupo`
(Field.tsx), `Abas` (Tabs.tsx), `Busca` (SearchInput.tsx), `Filtros`/`FiltroSelecao`/`FiltrosEtapas` (Filters.tsx), `Indicador`
(StatCard.tsx), `Aviso` (Alert.tsx), `GradeBlocos`/`BlocoInfo`/`ItemInfo`/`SecaoInfo`/`PainelInfo`/`LinhaInfo`/`Dados`/`Dado`/
`FaixaNumeros` (InfoGrid.tsx), `PassoLinhaDoTempo`/`ProgressoEtapas` (LinhaDoTempo.tsx), `EtiquetaLeiteCru`/
`EtiquetaLeitePasteurizado`/`FichaDistribuicaoImpressa` (Etiquetas.tsx), `Logo`, `StatusBadge`, `useNotificacao` (Notificacao.tsx).

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
  page.tsx              "/" redireciona para "/dashboard" (ou "/login")
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

1. Crie os tipos em `types/`, as chamadas em `services/` e os hooks em `hooks/`
   (copie uma área existente, ex.: `hospitais`).
2. Crie a página, ex.: `app/(dashboard)/hospitais/page.tsx`, seguindo o padrão
   das telas (veja "Padrão de tela" abaixo).
3. Adicione o item no menu em `lib/navigation.ts` (o `href` precisa bater com a
   rota da pasta). O Sidebar marca o item ativo sozinho.


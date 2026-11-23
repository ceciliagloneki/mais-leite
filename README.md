# +Leite — Frontend (Next.js)

Painel do Banco de Leite Humano de Marília. Consome a API PHP da pasta `mais-leite-back`.

## Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS com design tokens (HSL) em `app/globals.css`
- TanStack Query para os dados da API
- Vitest para testes

## Como rodar

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8090
npm run dev                  # http://localhost:3000
```

| Comando             | Descrição                                   |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento                 |
| `npm run build`     | Build de produção (também confere os tipos) |
| `npm run typecheck` | Confere os tipos (TypeScript)               |
| `npm run test`      | Testes (Vitest)                             |
| `npm run format`    | Formata o código (Prettier)                 |

## Estrutura

```text
app/
  login/                    tela de login
  (dashboard)/              área logada (com o menu lateral)
    dashboard/              painel
    doadoras/               lista + ficha; doadoras/[id] = triagem e sorologias
    coleta-domiciliar/      visitas e frascos crus
    recepcao/               recepção e conformidade
    processamento/          pasteurização, reenvase e análise
    hospitais/              hospitais, pedidos e receitas
    preparacao/             frasco destinado a cada RN
    distribuicao/           ficha, baixa e devolução
    rastreabilidade/        caminho completo de cada frasco, da coleta ao bebê
    funcionarios/           equipe
components/                 componentes comuns (DataTable, Card, Modal, FormModal, Field, Etiquetas, Logo...)
hooks/                      um arquivo por área (useQuery / useSalvar) + use-frascos (rastreabilidade)
services/                   chamadas à API (api.ts + um arquivo por área)
types/                      tipos com os mesmos nomes de campos do banco
lib/                        auth, navegação, formulários, formatação e regras (zonas, tipo de leite)
```

## Como uma tela funciona

Página → hook (`hooks/`) → service (`services/`) → API.

- **Listas:** `const doadoras = useDoadoras();` e `<DataTable itens={doadoras.data} colunas={[...]} />`.
- **Formulários:** `<FormModal onSubmit={criar.mutateAsync} onFechar={...}>` com campos `<Campo name="...">`.
  O `name` de cada campo é exatamente o nome que a API espera. Depois de salvar, todas as listas
  da tela são recarregadas automaticamente (`hooks/use-salvar.ts`).

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para os padrões do projeto.

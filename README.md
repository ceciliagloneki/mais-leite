# +Leite — Banco de Leite Humano de Marília

Projeto da disciplina **Fábrica de Projetos**, turma **BCC02-C**.

O +Leite é um sistema para o processo de trabalho do Banco de Leite Humano (BLH). Ele cobre o fluxo **captação e triagem → coleta domiciliar → recepção → pasteurização/reenvase → demanda hospitalar → preparação → distribuição** e permite rastrear cada frasco até a sorologia da doadora.

## Integrantes

- Ana Júlia
- Anne
- Cecília
- Maria Clara
- Maria Julia
- Rafael

## Estrutura do repositório

| Pasta | Conteúdo |
| --- | --- |
| [`mais-leite-backend`](mais-leite-backend/README.md) | API em PHP 8 + MySQL (controllers, services, repositories, models, DTOs, enums, middlewares) |
| [`mais-leite-frontend`](mais-leite-frontend/README.md) | Painel em Next.js 14 + TypeScript + Tailwind |

Documentação do backend:

- [API.md](mais-leite-backend/docs/API.md): endpoints da API.
- [REGRAS.md](mais-leite-backend/docs/REGRAS.md): regras de negócio e onde cada uma está no código.

## Tecnologias

- **Backend:** PHP 8, MySQL, Composer
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, TanStack Query, Vitest

## Como rodar

### Pré-requisitos

- PHP 8.1 ou superior e [Composer](https://getcomposer.org/)
- MySQL 8 (ou MariaDB)
- Node.js 20 e npm

### 1. Banco de dados

Crie um banco vazio no MySQL:

```sql
CREATE DATABASE mais_leite CHARACTER SET utf8mb4;
```

### 2. Backend (API)

```bash
cd mais-leite-backend
cp .env.example .env      # preencha os dados do banco e troque o APP_SECRET
composer install
composer migrate          # cria as tabelas
composer seed             # cria o usuário admin e 2 hospitais de exemplo
composer seed:demo        # (opcional) dados de demonstração
composer serve            # API em http://localhost:8090
```

### 3. Frontend (painel)

Em outro terminal:

```bash
cd mais-leite-frontend
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8090
npm install
npm run dev                  # http://localhost:3000
```

### 4. Acesso

Entre com o usuário criado pelo seed:

- **E-mail:** `admin@maisleite.local`
- **Senha:** `MaisLeite@123`

### Testes do frontend

```bash
cd mais-leite-frontend
npm test            # testes com Vitest
npm run typecheck   # checagem de tipos
```

## Deploy

### Backend no Railway

O backend tem um `Dockerfile`. Ao iniciar, ele cria as tabelas e o usuário admin, depois sobe a API.

1. No [Railway](https://railway.com), crie um projeto com **Deploy from GitHub repo** e escolha este repositório.
2. No serviço criado, vá em **Settings → Root Directory** e coloque `mais-leite-backend`.
3. No projeto, adicione um banco com **+ Create → Database → MySQL**.
4. No serviço da API, em **Variables**, crie:

   | Variável | Valor |
   | --- | --- |
   | `DB_HOST` | `${{MySQL.MYSQLHOST}}` |
   | `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
   | `DB_NAME` | `${{MySQL.MYSQLDATABASE}}` |
   | `DB_USER` | `${{MySQL.MYSQLUSER}}` |
   | `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
   | `APP_SECRET` | um texto grande e aleatório |
   | `FRONTEND_URL` | a URL do frontend na Vercel (sem `/` no final) |

5. Em **Settings → Networking**, clique em **Generate Domain**. Essa é a URL da API.

### Frontend na Vercel

1. Na Vercel, importe este repositório.
2. Em **Root Directory**, escolha `mais-leite-frontend`. O framework é detectado como Next.js.
3. Em **Environment Variables**, crie `NEXT_PUBLIC_API_URL` com a URL da API gerada no Railway.
4. Clique em **Deploy**.

## Telas (ordem do menu lateral)

| Tela | O que faz | Regra principal |
| --- | --- | --- |
| 1. Doadoras | Ficha de identificação, funil de segurança (triagem) e sorologias | Ficha não conforme não cadastra. Ativa = triagem conforme + 1ª amostra normal. Sorologia alterada remove a doadora e bloqueia o leite dela |
| 2. Coleta domiciliar | Visitas por zona, registro da visita e frascos crus (etiqueta) | Visita só no dia da semana da zona da doadora; só doadora ativa doa leite; tipo de leite calculado pela data do parto |
| 3. Recepção | Rastreio logístico, inspeção física e conformidade | Cada caixa traz frascos de uma zona só; não conforme exige motivo e descarta os frascos |
| 4. Processamento | Pasteurização, reenvase por doadora (nova etiqueta) e análise físico-química | Só frasco conforme é pasteurizado; reenvase ≤ leite cru da doadora; BGBL negativo e Dornic ≤ 8 libera o estoque |
| 5. Hospitais e pedidos | Pedido do dia (volume e nº de bebês) e receitas por RN | — |
| 6. Preparação | Frasco destinado a cada RN | Tipo C/T/M do frasco igual ao prescrito |
| 7. Distribuição | Ficha de distribuição, baixa (administração) e devolução de frascos | Caixa térmica de 200/250/300/350 mL; recebidos ≤ enviados |
| Rastreabilidade | Caminho de cada frasco: doadora e sorologia → coleta → recepção → pasteurização → reenvase e análise → bebê | — |

## Fluxo de desenvolvimento

O projeto segue o padrão da Fábrica de Projetos: branches `main` (versão estável), `develop` (em desenvolvimento) e `feature/*` (uma por funcionalidade), com commits no formato `tipo: descrição` (`feat`, `fix`, `refactor`, `docs`, `test`, `chore`).

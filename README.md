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
| [`deploy`](deploy/aws-ec2.sh) | Script de deploy na AWS (veja [Deploy](#deploy)) |

Documentação do backend:

- [API.md](mais-leite-backend/docs/API.md): endpoints da API.
- [REGRAS.md](mais-leite-backend/docs/REGRAS.md): regras de negócio e onde cada uma está no código.

## Tecnologias

- **Backend:** PHP 8, MySQL, Composer
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, TanStack Query
- **Infraestrutura:** Docker, Docker Compose, AWS EC2

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

### Com Docker (tudo de uma vez)

Se tiver o Docker instalado, dá para subir o banco, a API e o painel com um comando só, sem instalar PHP, MySQL nem Node:

```bash
PUBLIC_HOST=localhost APP_SECRET=uma-chave-grande DB_PASSWORD=uma-senha docker compose up -d --build
```

O painel fica em `http://localhost` e a API em `http://localhost:8090`. Para carregar os dados de demonstração:

```bash
docker compose exec api php scripts/seed_demo.php 2026-11-26
```

## Deploy

O sistema está no ar na AWS (serviço de nuvem da Amazon):

- **Painel:** http://3.15.0.88
- **API:** http://3.15.0.88:8090

Ele já tem os dados de demonstração para a apresentação de 26/11/2026. O login é o mesmo de [Acesso](#4-acesso).

### Como funciona

Alugamos um computador na AWS (chamado de **EC2**) e rodamos o sistema inteiro nele, com o **Docker**. O Docker separa o sistema em 3 partes, e cada uma roda isolada:

| Parte | O que é | Porta |
| --- | --- | --- |
| `web` | O painel (Next.js), que a gente abre no navegador | 80 |
| `api` | A API em PHP, que guarda e confere os dados | 8090 |
| `db` | O banco MySQL | só a API acessa |

O arquivo [`docker-compose.yml`](docker-compose.yml) diz como essas 3 partes sobem juntas.

### Como publicar

Tudo é feito pelo script [`deploy/aws-ec2.sh`](deploy/aws-ec2.sh). Ele cria o computador na AWS, instala o Docker, baixa este repositório do GitHub e liga o sistema. Leva uns 5 minutos.

1. Instale a [AWS CLI](https://docs.aws.amazon.com/cli/) e configure sua chave de acesso com `aws configure`.
2. Confira se as mudanças já estão na `main` do GitHub, porque é de lá que o script baixa o código.
3. Rode:

   ```bash
   ./deploy/aws-ec2.sh                         # sistema vazio, só com o admin
   SEED_DEMO=2026-11-26 ./deploy/aws-ec2.sh    # com os dados de demonstração
   ```

4. No final, o script mostra o endereço do sistema e o comando para apagar a máquina.

### Desligar e religar

A máquina só é cobrada enquanto está ligada (o disco é cobrado sempre, mas é barato). Para desligar e religar:

```bash
aws ec2 stop-instances  --region us-east-2 --instance-ids i-072ff8b5bce7bbddb
aws ec2 start-instances --region us-east-2 --instance-ids i-072ff8b5bce7bbddb
```

> **Atenção:** cada vez que a máquina religa, ela ganha um **endereço (IP) novo**. Ela mesma percebe a troca e refaz o painel com o endereço novo, o que leva uns 5 minutos. Os dados do banco continuam lá. Para ver o endereço novo:
>
> ```bash
> aws ec2 describe-instances --region us-east-2 --instance-ids i-072ff8b5bce7bbddb --query 'Reservations[0].Instances[0].PublicIpAddress' --output text
> ```

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

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
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, TanStack Query, Vitest
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

### Testes do frontend

```bash
cd mais-leite-frontend
npm test            # testes com Vitest
npm run typecheck   # checagem de tipos
```

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

O sistema está publicado na AWS:

- **Painel:** http://52.15.60.95
- **API:** http://52.15.60.95:8090

O banco foi carregado com os dados de demonstração para 26/11/2026, dia da apresentação. O login é o mesmo do seed (veja [Acesso](#4-acesso)).

### Como o deploy na AWS foi feito

Tudo roda numa única máquina virtual (EC2) com Docker Compose. É o jeito mais simples de publicar o projeto inteiro e cabe no plano gratuito da AWS.

```text
AWS · us-east-2 (Ohio) · EC2 t3.small · Ubuntu 24.04
├── web  (porta 80)    painel Next.js em modo produção
├── api  (porta 8090)  API PHP 8.3; cria as tabelas e o admin ao iniciar
└── db   (interna)     MySQL 8, com os dados num volume persistente
```

Arquivos usados:

| Arquivo | Para que serve |
| --- | --- |
| [`docker-compose.yml`](docker-compose.yml) | Define os 3 containers (`db`, `api`, `web`) e liga um ao outro |
| [`mais-leite-backend/Dockerfile`](mais-leite-backend/Dockerfile) | Imagem da API |
| [`mais-leite-frontend/Dockerfile`](mais-leite-frontend/Dockerfile) | Imagem do painel; a URL da API entra no build |
| [`deploy/aws-ec2.sh`](deploy/aws-ec2.sh) | Script que cria a máquina na AWS e sobe tudo |

O que o script `deploy/aws-ec2.sh` faz, em ordem:

1. Busca a imagem mais recente do Ubuntu 24.04.
2. Cria o grupo de segurança `mais-leite`, que libera só as portas 80 (painel) e 8090 (API). O banco não fica exposto na internet.
3. Gera uma `APP_SECRET` e uma senha do banco aleatórias.
4. Cria a máquina EC2 com um script de inicialização que:
   - cria 2 GB de swap (o build do Next.js precisa de memória);
   - instala o Docker;
   - clona este repositório do GitHub;
   - descobre o IP público da máquina e grava o `.env` com o IP e as senhas;
   - roda `docker compose up -d --build`;
   - se a variável `SEED_DEMO` foi informada, carrega os dados de demonstração dessa data.
5. Mostra o endereço do painel e o comando para apagar a máquina.

A instalação leva cerca de 5 minutos depois que a máquina liga.

### Como publicar de novo

Pré-requisitos: [AWS CLI](https://docs.aws.amazon.com/cli/) instalada e uma chave de acesso configurada com `aws configure`. O usuário da chave precisa das permissões `AmazonEC2FullAccess` e `AmazonSSMReadOnlyAccess`.

```bash
./deploy/aws-ec2.sh                          # sistema vazio, só com o admin
SEED_DEMO=2026-11-26 ./deploy/aws-ec2.sh     # já com os dados de demonstração
```

O script baixa o código do GitHub, então as mudanças precisam estar na `main` antes de rodar.

Variáveis opcionais:

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `AWS_REGION` | `us-east-2` | Região da AWS. Na conta do grupo, só Ohio libera a criação de máquinas. |
| `INSTANCE_TYPE` | `t3.small` | Tipo da máquina. Com menos de 2 GB de RAM, o build do painel fica lento. |
| `SEED_DEMO` | vazio | Data de referência dos dados de demonstração (`AAAA-MM-DD`). |

Para apagar a máquina (os dados do banco também são apagados):

```bash
aws ec2 terminate-instances --region us-east-2 --instance-ids <id-da-instância>
```

> **Atenção:** a URL da API é gravada no build do painel. Se a máquina for parada e iniciada de novo, o IP público muda e o painel para de encontrar a API. Nesse caso, é preciso criar uma máquina nova com o script ou associar um Elastic IP para manter o endereço fixo.

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

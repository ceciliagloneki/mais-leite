# Backend +Leite — PHP + MySQL

API REST em PHP puro (POO), seguindo o padrão **controller → service → repository**.

## Instalar e executar

Requer PHP 8.1+, extensão pdo_mysql, Composer e MySQL 8.

```bash
cp .env.example .env      # preencha DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD e APP_SECRET
composer install
composer migrate          # cria as tabelas (src/database/migrations/mais_leite.sql)
composer seed             # admin@maisleite.local / MaisLeite@123 + 2 hospitais
composer seed:demo        # (opcional) apaga tudo e cria os dados de demonstração
composer serve            # http://localhost:8090
```

> O `composer migrate` usa `CREATE TABLE IF NOT EXISTS`. Se o banco tiver tabelas de uma versão
> antiga do projeto, crie um banco novo (ou apague as tabelas antigas) antes de migrar.

## Estrutura

```text
public/index.php          entrada da API (CORS + roteador)
src/routes/routes.php     todas as rotas, agrupadas pelas fases do PDF
src/controllers/          lê o JSON, chama o service e devolve a resposta
src/services/             regras de negócio do BLH
src/repositories/         SQL com PDO
src/models/               dados que serão gravados
src/dtos/                 valida os campos recebidos
src/enums/                status permitidos
src/middlewares/          autenticação (token)
src/utils/                Response (JSON) e Validation (leitura dos campos)
src/database/             conexão e o arquivo SQL com todas as tabelas
scripts/                  migrate, seed e seed_demo
```

Exemplo do caminho de uma requisição: `POST /recepcoes` → `RecepcaoController::create` →
`CreateRecepcaoDTO` (valida os campos) → `RecepcaoService::create` (regras) →
`RecepcaoRepository::create` + `FrascoLeiteCruRepository::registrarRecepcao` (SQL).

## Como adicionar um módulo

1. Crie a tabela em `src/database/migrations/mais_leite.sql`.
2. Crie o Model, o DTO, o Repository, o Service e o Controller copiando um módulo existente (ex.: Hospital).
3. Registre as rotas em `src/routes/routes.php` (use `protectedGet/protectedPost` para exigir login).
4. Se criar uma pasta nova em `src/dtos`, adicione o namespace no `composer.json` e rode `composer dump-autoload`.

## Respostas

- Sucesso: o JSON do recurso (ou `{ "id": 1 }` ao criar).
- Erro: `{ "error": "mensagem" }` com HTTP 400 (validação/regra), 401 (sem login) ou 404.
- Rotas protegidas exigem o header `Authorization: Bearer <token>` recebido em `POST /auth/login`.

Veja os endpoints em [docs/API.md](docs/API.md) e as regras em [docs/REGRAS.md](docs/REGRAS.md).

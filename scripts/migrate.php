<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';
Dotenv\Dotenv::createImmutable(__DIR__ . '/..')->safeLoad();

use MaisLeiteBackend\Database\Database;

function separarEndereco(PDO $db): void
{
    $temColuna = fn (string $coluna) => (bool) $db->query(
        "SELECT COUNT(*) FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'doadora' AND COLUMN_NAME = " . $db->quote($coluna)
    )->fetchColumn();

    if (!$temColuna('endereco')) {
        return;
    }

    if (!$temColuna('endereco_rua')) {
        $db->exec("ALTER TABLE doadora
            ADD COLUMN endereco_rua VARCHAR(255) NULL AFTER endereco,
            ADD COLUMN endereco_numero VARCHAR(20) NULL AFTER endereco_rua,
            ADD COLUMN endereco_bairro VARCHAR(120) NULL AFTER endereco_numero");
    }

    $atualizar = $db->prepare("UPDATE doadora SET endereco_rua = ?, endereco_numero = ?, endereco_bairro = ? WHERE id = ?");
    foreach ($db->query("SELECT id, endereco FROM doadora WHERE endereco IS NOT NULL AND endereco <> ''") as $linha) {
        $partes = array_values(array_filter(array_map('trim', explode(',', $linha['endereco'])), 'strlen'));
        if (count($partes) >= 2 && ctype_digit($partes[0]) && !ctype_digit($partes[1])) {
            [$partes[0], $partes[1]] = [$partes[1], $partes[0]];
        }
        $rua = $partes[0] ?? null;
        $bairro = count($partes) >= 3 ? $partes[count($partes) - 1] : null;
        $numero = count($partes) >= 2 ? implode(', ', array_slice($partes, 1, count($partes) >= 3 ? -1 : null)) : null;
        $atualizar->execute([$rua, $numero !== null ? mb_substr($numero, 0, 20) : null, $bairro, $linha['id']]);
    }

    $db->exec("ALTER TABLE doadora DROP COLUMN endereco");
    echo "Endereço das doadoras separado em rua, número e bairro.\n";
}

function adicionarStatusVisita(PDO $db): void
{
    $existe = (bool) $db->query(
        "SELECT COUNT(*) FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'visita_coleta' AND COLUMN_NAME = 'status'"
    )->fetchColumn();

    if ($existe) {
        return;
    }

    $db->exec("ALTER TABLE visita_coleta
        ADD COLUMN status ENUM('agendada','realizada','cancelada') NOT NULL DEFAULT 'realizada'
        COMMENT 'agendada -> realizada (ou cancelada)' AFTER frascos_esterilizados");
    echo "Coluna visita_coleta.status criada (visitas antigas marcadas como realizadas).\n";
}

function adicionarFrascosRecebidos(PDO $db): void
{
    $existe = (bool) $db->query(
        "SELECT COUNT(*) FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'visita_coleta' AND COLUMN_NAME = 'frascos_recebidos'"
    )->fetchColumn();

    if ($existe) {
        return;
    }

    $db->exec("ALTER TABLE visita_coleta
        ADD COLUMN frascos_recebidos INT UNSIGNED NOT NULL DEFAULT 0
        COMMENT 'frascos com leite recebidos da doadora' AFTER frascos_esterilizados");
    echo "Coluna visita_coleta.frascos_recebidos criada.\n";
}

function marcarDoadorasRemovidas(PDO $db): void
{
    $db->exec("UPDATE doadora d SET d.status = 'removida'
        WHERE d.status <> 'removida' AND EXISTS (SELECT 1 FROM sorologia s WHERE s.doadora_id = d.id AND s.resultado = 'alterado')");
}

try {
    $db = Database::getConnection();
    $sql = file_get_contents(__DIR__ . '/../src/database/migrations/mais_leite.sql');
    $db->exec($sql);
    separarEndereco($db);
    adicionarStatusVisita($db);
    adicionarFrascosRecebidos($db);
    marcarDoadorasRemovidas($db);
    echo "Tabelas criadas com sucesso.\n";
} catch (Throwable $e) {
    fwrite(STDERR, "Falha na migração: " . $e->getMessage() . "\nConfira o .env e se o MySQL está ativo.\n");
    exit(1);
}

<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Database;

use PDO;

/**
 * Cria e reutiliza uma única conexão PDO com o banco de dados.
 */
final class Database
{
    private static ?PDO $connection = null;

    public static function getConnection(): PDO
    {
        // Implementar a conexão.
    }
}

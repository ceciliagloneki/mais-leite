<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Models\Sorologia;
use PDO;

final class SorologiaRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(Sorologia $sorologia): int
    {
        $sql = "INSERT INTO sorologia (doadora_id, numero_amostra, data_coleta, resultado)
                VALUES (:doadora_id, :numero_amostra, :data_coleta, :resultado)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'doadora_id' => $sorologia->doadoraId,
            'numero_amostra' => $sorologia->numeroAmostra,
            'data_coleta' => $sorologia->dataColeta,
            'resultado' => $sorologia->resultado,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findByDoadora(int $doadoraId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM sorologia WHERE doadora_id = :doadora_id ORDER BY numero_amostra");
        $stmt->execute(['doadora_id' => $doadoraId]);

        return $stmt->fetchAll();
    }

    public function amostraExists(int $doadoraId, int $numeroAmostra): bool
    {
        $stmt = $this->db->prepare("SELECT id FROM sorologia WHERE doadora_id = :doadora_id AND numero_amostra = :numero");
        $stmt->execute(['doadora_id' => $doadoraId, 'numero' => $numeroAmostra]);

        return $stmt->fetch() !== false;
    }
}

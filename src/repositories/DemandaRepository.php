<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Models\Demanda;
use PDO;

final class DemandaRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(Demanda $demanda): int
    {
        $sql = "INSERT INTO demanda (hospital_id, data_demanda, volume_total, numero_de_bebes)
                VALUES (:hospital_id, :data_demanda, :volume_total, :numero_de_bebes)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'hospital_id' => $demanda->hospitalId,
            'data_demanda' => $demanda->dataDemanda,
            'volume_total' => $demanda->volumeTotal,
            'numero_de_bebes' => $demanda->numeroDeBebes,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT d.*, h.nome AS hospital_nome
                FROM demanda d
                INNER JOIN hospital h ON h.id = d.hospital_id
                WHERE d.id = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);

        $result = $stmt->fetch();

        return $result ?: null;
    }

    public function findAll(): array
    {
        $sql = "SELECT d.*, h.nome AS hospital_nome,
                       (SELECT COUNT(*) FROM prescricao p WHERE p.demanda_id = d.id) AS quant_prescricoes
                FROM demanda d
                INNER JOIN hospital h ON h.id = d.hospital_id
                ORDER BY d.data_demanda DESC, d.id DESC";

        return $this->db->query($sql)->fetchAll();
    }

    public function marcarAtendida(int $id): bool
    {
        $stmt = $this->db->prepare("UPDATE demanda SET status = 'atendida' WHERE id = :id");

        return $stmt->execute(['id' => $id]);
    }
}

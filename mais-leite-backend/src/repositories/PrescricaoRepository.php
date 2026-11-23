<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Models\Prescricao;
use PDO;

final class PrescricaoRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(Prescricao $prescricao): int
    {
        $sql = "INSERT INTO prescricao (demanda_id, nome_do_rn, volume_prescrito, tipo_leite)
                VALUES (:demanda_id, :nome_do_rn, :volume_prescrito, :tipo_leite)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'demanda_id' => $prescricao->demandaId,
            'nome_do_rn' => $prescricao->nomeDoRn,
            'volume_prescrito' => $prescricao->volumePrescrito,
            'tipo_leite' => $prescricao->tipoLeite,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT p.*, d.status AS demanda_status
                FROM prescricao p
                INNER JOIN demanda d ON d.id = p.demanda_id
                WHERE p.id = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);

        $result = $stmt->fetch();

        return $result ?: null;
    }

    public function findAll(): array
    {
        $sql = "SELECT p.*, d.data_demanda, d.status AS demanda_status, h.nome AS hospital_nome,
                       (SELECT COALESCE(SUM(fp.volume), 0)
                          FROM frasco_distribuicao fd
                          INNER JOIN frasco_pasteurizado fp ON fp.id = fd.frasco_pasteurizado_id
                         WHERE fd.prescricao_id = p.id AND fp.status IN ('alocado', 'distribuido')) AS volume_alocado
                FROM prescricao p
                INNER JOIN demanda d ON d.id = p.demanda_id
                INNER JOIN hospital h ON h.id = d.hospital_id
                ORDER BY d.data_demanda DESC, p.id DESC";

        return $this->db->query($sql)->fetchAll();
    }
}

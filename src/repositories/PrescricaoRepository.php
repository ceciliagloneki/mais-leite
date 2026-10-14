<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Enums\TipoleiteEnum;
use MaisLeiteBackend\Models\Prescricao;
use PDO;

final class PrescricaoRepository
{
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function create(Prescricao $prescricao) : int {
        $sql = "INSERT INTO prescricao (demanda_id, volume_prescrito, nome_do_rn, tipo_leite)
                VALUES (:demanda_id, :volume_prescrito, :nome_do_rn, :tipo_leite)";

        $statement = $this->db->prepare($sql);
        $statement->execute([
            'demanda_id'       => $prescricao->demanda_id,
            'volume_prescrito' => $prescricao->volume_prescrito,
            'nome_do_rn'       => $prescricao->nome_do_rn,
            'tipo_leite'       => $prescricao->tipo_leite->value
        ]);
        
        return (int) $this->db->lastInsertId();
    }

    public function findById(int $id) : ?array {
        $sql = "SELECT id, demanda_id, volume_prescrito, nome_do_rn, tipo_leite
                FROM prescricao
                WHERE id = :id
                AND deleted_at IS NULL";

        $statement = $this->db->prepare($sql);
        $statement->execute(['id' => $id]);

        $res = $statement->fetch();
        return $res ?: null;
    }

    public function findAll(?int $demanda_id = null, ?TipoleiteEnum $tipo_leite = null) : array {
        $sql = "SELECT id, demanda_id, volume_prescrito, nome_do_rn, tipo_leite
                FROM prescricao
                WHERE deleted_at IS NULL";

        $params = [];

        if ($demanda_id !== null) {
            $sql .= " AND demanda_id = :demanda_id";
            $params['demanda_id'] = $demanda_id;
        }

        if ($tipo_leite !== null) {
            $sql .= " AND tipo_leite = :tipo_leite";
            $params['tipo_leite'] = $tipo_leite->value;
        }

        $sql .= " ORDER BY id ASC";

        $statement = $this->db->prepare($sql);
        $statement->execute($params);

        return $statement->fetchAll();
    }

    public function update(int $id, array $data) : bool {
        $fields = [];
        $params = ['id' => $id];

        foreach ($data as $key => $value) {
            $fields[] = "{$key} = :{$key}";
            $params[$key] = $value;
        }

        $sql = "UPDATE prescricao SET" .
                implode(', ', $fields) .
                " WHERE id = :id";

        $statement = $this->db->prepare($sql);
        return $statement->execute($params);
    }

    public function delete(int $id) : bool {
        $sql = "UPDATE prescricao
                SET deleted_at = CURRENT_TIMESTAMP
                WHERE id = :id
                AND deleted_at IS NULL";

        $statement = $this->db->prepare($sql);
        return $statement->execute(['id' => $id]);
    }

    public function demandaExists(int $id) : bool {
        $sql = "SELECT id from demanda
                WHERE id = :id
                AND status_solicitacao
                IN ('pendente', 'aprovada')";
        
        $statement = $this->db->prepare($sql);
        $statement->execute(['id' => $id]);

        return $statement->fetch() !== false;
    }
}

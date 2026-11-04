<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Enums\StatusSolicitacaoEnum;
use MaisLeiteBackend\Models\Demanda;
use PDO;

final class DemandaRepository
{
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function create(Demanda $demanda) : int {
        $sql = "INSERT INTO demanda (hospital_id, volume_total, numero_de_bebes, data_demanda, status_solicitacao)
                VALUES (:hospital_id, :volume_total, :numero_de_bebes, :data_demanda, :status_solicitacao)";
            
        $statement = $this->db->prepare($sql);
        $statement->execute([
            'hospital_id'         => $demanda->hospital_id,
            'volume_total'       => $demanda->volume_total,
            'numero_de_bebes'    => $demanda->numero_de_bebes,
            'data_demanda'       => $demanda->data_demanda,
            'status_solicitacao' => $demanda->status_solicitacao->value
        ]);
    
        return (int) $this->db->lastInsertId();
    }

    public function findById(int $id): ?array {
        $sql = "SELECT dm.*, h.nome AS hospital_nome
                FROM demanda dm
                INNER JOIN hospital h ON h.id = dm.hospital_id
                WHERE dm.id = :id";

        $statement = $this->db->prepare($sql);
        $statement->execute(['id' => $id]);

        $res = $statement->fetch();
        return $res ?: null;
    }

    public function findAll(?StatusSolicitacaoEnum $status = null) : array {
        $sql = "SELECT dm.*, h.nome AS hospital_nome
                FROM demanda dm
                INNER JOIN hospital h ON h.id = dm.hospital_id";

        $params = [];

        if ($status !== null) {
            $sql .= " WHERE dm.status_solicitacao = :status_solicitacao";
            $params['status_solicitacao'] = $status->value;
        }

        $sql .= " ORDER BY dm.data_demanda DESC, h.nome ASC";

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

        $sql = "UPDATE demanda SET " . 
                implode(', ', $fields) .
               " WHERE id = :id";

        $statement = $this->db->prepare($sql);
        return $statement->execute($params);
    }

    public function delete(int $id) : bool {
        $sql = "UPDATE demanda 
                SET status_solicitacao = :status_solicitacao
                WHERE id = :id";

        $statement = $this->db->prepare($sql);

        return $statement->execute([
            'id' => $id,
            'status_solicitacao' => StatusSolicitacaoEnum::CANCELADA->value,
        ]);
    }

    public function hospitalExists(int $id) : bool {
        $sql = "SELECT id FROM hospital
                WHERE id = :id
                AND status = 'ativo'";
        
        $statement = $this->db->prepare($sql);
        $statement->execute(['id' => $id]);

        return $statement->fetch() !== false;
    }
}
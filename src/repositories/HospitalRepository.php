<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Models\Hospital;
use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Enums\StatusEnum;
use PDO;

class HospitalRepository
{
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function create(Hospital $hospital) : int {
        $sql = "INSERT INTO hospital (nome, telefone, status)
                VALUES (:nome, :telefone, :status)";

        $statement = $this->db->prepare($sql);
        $statement->execute([
            'nome'     => $hospital->nome,
            'telefone' => $hospital->telefone,
            'status'   => $hospital->status
        ]);

        return (int) $this->db->lastInsertId();
    }
    
    public function findById(int $id) : ?array {
        $sql = "SELECT id, nome, telefone, status
                FROM hospital
                WHERE id = :id";

        $statement = $this->db->prepare($sql);
        $statement->execute(['id' => $id]);

        $result = $statement->fetch();
        
        return $result ?: null;
    }

    public function findAll(?StatusEnum $status = null) : array {
        $sql = "SELECT id, nome, telefone, status
                FROM hospital";
        
        $params = [];

        if ($status !== null) {
            $sql .= " WHERE status = :status";
            $params['status'] = $status->value;
        }

        $sql .= " ORDER BY nome ASC";

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

        $sql = "UPDATE hospital
                SET " . implode(', ', $fields) .
                " WHERE id = :id";

        $statement = $this->db->prepare($sql);
        
        return $statement->execute($params);
    }

    public function delete(int $id) : bool {
        $sql = "UPDATE hospital 
                SET status = :status 
                WHERE id = :id";
            
        $statement = $this->db->prepare($sql);

        return $statement->execute([
            'id'     => $id,
            'status' => StatusEnum::INATIVO->value
        ]);
    }
}
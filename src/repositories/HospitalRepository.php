<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Models\Hospital;
use MaisLeiteBackend\Database\Database;


class HospitalRepository
{
    public function create(Hospital $hospital) : int {
        $sql = "INSERT INTO hospital (
                nome, telefone, status
                ) VALUES (
                :nome, :telefone, :status
                )";

        $pdo      = Database::getConnection();
        $statement = $pdo->prepare($sql);

        $statement->execute([
            ':nome'     => $hospital->getNome(),
            ':telefone' => $hospital->getTelefone(),
            ':status'   => $hospital->getStatus()
        ]);
    
        return (int) $pdo->lastInsertId();
    }

    public function findById(int $id) : ?Hospital {
        $sql = "SELECT id, nome, telefone, status
                FROM hospital
                WHERE id = :id";
        
        $pdo = Database::getConnection();
        $statement = $pdo->prepare($sql);

        $statement->execute([
            ':id' => $id
        ]);

        $data = $statement->fetch(\PDO::FETCH_ASSOC);

        if (!$data) {
            return null;
        }

        return new Hospital(
            (int) $data['id'],
            $data['nome'],
            $data['telefone'],
            $data['status']
        );
    }

    public function findAll(?string $status = null) : array {
        $sql = "SELECT id, nome, telefone, status
                FROM hospital";
        
        $params = [];

        if ($status !== null) {
            $sql .= " WHERE status = :status";
            $params[':status'] = $status;
        }

        $pdo = Database::getConnection();
        $statement = $pdo->prepare($sql);

        $statement->execute($params);

        $hospitais = [];

        while ($data = $statement->fetch(\PDO::FETCH_ASSOC)) {
            $hospitais[] = new Hospital (
                (int) $data['id'],
                $data['nome'],
                $data['telefone'],
                $data['status']
            );
        }

        return $hospitais;
    }

    public function update(Hospital $hospital) : bool {
        $sql = "UPDATE hospital
                SET nome = :nome, telefone = :telefone, status = :status
                WHERE id = :id";

        $pdo = Database::getConnection();
        $statement = $pdo->prepare($sql);

        return $statement->execute([
            ':nome'     => $hospital->getNome(),
            ':telefone' => $hospital->getTelefone(),
            ':status'   => $hospital->getStatus(),
            ':id'       => $hospital->getId()
        ]);
    }
    public function delete(int $id) : bool{
        $sql = "UPDATE hospital
                SET status = 'inativo'
                WHERE id = :id";

        $pdo = Database::getConnection();
        $statement = $pdo->prepare($sql);

        return $statement->execute([
            ':id' => $id
        ]);
    }
}
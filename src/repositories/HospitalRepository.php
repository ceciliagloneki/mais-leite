<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;


class HospitalRepository
{
    public function create(
        string  $nome,
        ?string $telefone,
        string  $status
    ) :int {
        $conn = Database::getConnection();
        
        $statment = $conn->prepare(
            'INSERT INTO hospital (nome, telefone, status) VALUES (:nome, :telefone, :status)'
        );

        $statment->execute([
            'nome'     => $nome,
            'telefone' => $telefone,
            'status'   => $status,
        ]);

        return (int) $conn->lastInsertId();
    }
    public function findById() {}
    public function findAll() {}
    public function update() {}
    public function delete() {}
}
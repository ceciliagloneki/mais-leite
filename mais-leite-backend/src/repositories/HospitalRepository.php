<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Models\Hospital;
use PDO;

final class HospitalRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(Hospital $hospital): int
    {
        $stmt = $this->db->prepare("INSERT INTO hospital (nome, telefone) VALUES (:nome, :telefone)");
        $stmt->execute(['nome' => $hospital->nome, 'telefone' => $hospital->telefone]);

        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, Hospital $hospital): bool
    {
        $stmt = $this->db->prepare("UPDATE hospital SET nome = :nome, telefone = :telefone WHERE id = :id");

        return $stmt->execute(['id' => $id, 'nome' => $hospital->nome, 'telefone' => $hospital->telefone]);
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM hospital WHERE id = :id");
        $stmt->execute(['id' => $id]);

        $result = $stmt->fetch();

        return $result ?: null;
    }

    public function findByNome(string $nome): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM hospital WHERE nome = :nome");
        $stmt->execute(['nome' => $nome]);

        $result = $stmt->fetch();

        return $result ?: null;
    }

    public function findAll(): array
    {
        return $this->db->query("SELECT * FROM hospital ORDER BY nome")->fetchAll();
    }
}

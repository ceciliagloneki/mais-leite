<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Enums\StatusEnum;
use MaisLeiteBackend\Models\Funcionario;
use PDO;

class FuncionarioRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(Funcionario $funcionario): int
    {
        $sql = "INSERT INTO funcionario (nome, cargo, email, senha, status)
                VALUES (:nome, :cargo, :email, :senha, :status)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'nome' => $funcionario->nome,
            'cargo' => $funcionario->cargo,
            'email' => $funcionario->email,
            'senha' => $funcionario->senha,
            'status' => $funcionario->status,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT id, nome, cargo, email, senha, status
                FROM funcionario
                WHERE id = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);

        $result = $stmt->fetch();

        return $result ?: null;
    }

    public function findByEmail(string $email): ?array
    {
        $sql = "SELECT id, nome, cargo, email, senha, status
                FROM funcionario
                WHERE email = :email";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['email' => $email]);

        $result = $stmt->fetch();

        return $result ?: null;
    }

    public function findAll(?StatusEnum $status = null): array
    {
        $sql = "SELECT id, nome, cargo, email, senha, status
                FROM funcionario";

        $params = [];

        if ($status !== null) {
            $sql .= " WHERE status = :status";
            $params['status'] = $status->value;
        }

        $sql .= " ORDER BY nome ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = ['id' => $id];

        foreach ($data as $key => $value) {
            $fields[] = "{$key} = :{$key}";
            $params[$key] = $value;
        }

        $sql = "UPDATE funcionario SET " . implode(', ', $fields) . " WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute($params);
    }

    public function delete(int $id): bool
    {
        $sql = "UPDATE funcionario SET status = :status WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id' => $id,
            'status' => StatusEnum::INATIVO->value,
        ]);
    }
}

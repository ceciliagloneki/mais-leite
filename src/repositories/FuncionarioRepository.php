<?php

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Models\Funcionario;
use MaisLeiteBackend\Config\Database;

class FuncionarioRepository
{
    public function create(Funcionario $funcionario): int
    {
        $sql = "INSERT INTO funcionario
                (nome, cargo, email, senha, status)
                VALUES
                (:nome, :cargo, :email, :senha, :status)";

        $pdo = Database::getConnection();

        $stmt = $pdo->prepare($sql);

        $stmt->execute([
            ':nome' => $funcionario->getNome(),
            ':cargo' => $funcionario->getCargo(),
            ':email' => $funcionario->getEmail(),
            ':senha' => $funcionario->getSenha(),
            ':status' => $funcionario->getStatus(),
        ]);

        return (int) $pdo->lastInsertID();
    }

    public function findById(int $id): ?Funcionario
    {
        $sql = "SELECT id, nome, cargo, email, senha, status
                FROM funcionario
                WHERE id = :id";

        $pdo = Database::getConnection();

        $stmt = $pdo->prepare($sql);

        $stmt->execute([
            ':id' => $id
        ]);

        $data = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!data) {
            return null;
        }

        return new Funcionario(
            (int) $data['id'],
            $data['nome'],
            $data['cargo'],
            $data['email'],
            $data['senha'],
            $data['status']
        );
    }

    public function findByEmail(string $email): ?Funcionario
    {
        $sql = "SELECT id, nome, cargo, email, senha, status
                FROM funcionario
                WHERE email = :email";

        $pdo = Database::getConnection();

        $stmt = $pdo->prepare($sql);

        $stmt->execute([
            ':email' => $email
        ]);

        $data = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!data) {
            return null;
        }

        return new Funcionario(
            (int) $data['id'],
            $data['nome'],
            $data['cargo'],
            $data['email'],
            $data['senha'],
            $data['status']
        );
    }

    public function findAll(?string $status = null): array
    {
        $sql = "SELECT id, nome, cargo, email, senha, status
                FROM funcionario";

        $params = [];

        if ($status !== null) {
            $sql .= "WHERE status = :status";
            $params[':status'] = $status;
        }

        $pdo = Database::getConnection();

        $stmt = $pdo->prepare($sql);

        $stmt->execute($params);

        $funcionarios = [];

        while ($data = $stmt->fetch(\PDO::FETCH_ASSOC)){
            $funcionarios[] = new Funcionario (
                (int) $data['id'],
                $data['nome'],
                $data['cargo'],
                $data['email'],
                $data['senha'],
                $data['status']
            );
        }

        return $funcionarios;
    }

    public function update(Funcionario $funcionario): bool
    {
        $sql = "UPDATE funcionario
                SET nome = :nome,
                    cargo = :cargo,
                    email = :email,
                    senha = :senha,
                    status = :status
                WHERE id = :id";

        $pdo = Database::getConnection();

        $stmt = $pdo->prepare($sql);

        return $stmt->execute([
            ':nome' => $funcionario->getNome(),
            ':cargo' => $funcionario->getCargo(),
            ':email' => $funcionario->getEmail(),
            ':senha' => $funcionario->getSenha(),
            ':status' => $funcionario->getStatus(),
            ':id' => $funcionario->getId()
        ]);
    }

    public function delete()
    {
        $sql = "UPDATE funcionario
                SET status = 'inativo'
                WHERE id = :id";

        $pdo = Database::getConnectio();

        $stmt = $pdo->prepare($sql);

        return $stmt->execute([
            ':id' => $id
        ]);
    }
}
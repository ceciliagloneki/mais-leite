<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Enums\StatusColetaEnum;
use MaisLeiteBackend\Models\ColetaDomiciliar;
use PDO;

final class ColetaDomiciliarRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(ColetaDomiciliar $coleta): int
    {
        $sql = "INSERT INTO visita_coleta (funcionario_id, doadora_id, data, hora_coleta, volume_doado, status)
                VALUES (:funcionario_id, :doadora_id, :data, :hora_coleta, :volume_doado, :status)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'funcionario_id' => $coleta->funcionarioId,
            'doadora_id' => $coleta->doadoraId,
            'data' => $coleta->data,
            'hora_coleta' => $coleta->horaColeta,
            'volume_doado' => $coleta->volumeDoado,
            'status' => $coleta->status->value,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT vc.*, d.nome as doadora_nome, f.nome as funcionario_nome
                FROM visita_coleta vc
                INNER JOIN doadora d ON d.id = vc.doadora_id
                INNER JOIN funcionario f ON f.id = vc.funcionario_id
                WHERE vc.id = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);

        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function findAll(?StatusColetaEnum $status = null): array
    {
        $sql = "SELECT vc.*, d.nome as doadora_nome, f.nome as funcionario_nome
                FROM visita_coleta vc
                INNER JOIN doadora d ON d.id = vc.doadora_id
                INNER JOIN funcionario f ON f.id = vc.funcionario_id";

        $params = [];

        if ($status !== null) {
            $sql .= " WHERE vc.status = :status";
            $params['status'] = $status->value;
        }

        $sql .= " ORDER BY vc.data DESC, vc.hora_coleta DESC";

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

        $sql = "UPDATE visita_coleta SET " . implode(', ', $fields) . " WHERE id = :id";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete(int $id): bool
    {
        $sql = "UPDATE visita_coleta SET status = :status WHERE id = :id";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'id' => $id,
            'status' => StatusColetaEnum::CANCELADA->value,
        ]);
    }

    public function doadoraExists(int $id): bool
    {
        $sql = "SELECT id FROM doadora WHERE id = :id AND elegibilidade = 'ativa'";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch() !== false;
    }

    public function funcionarioExists(int $id): bool
    {
        $sql = "SELECT id FROM funcionario WHERE id = :id AND status = 'ativo'";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch() !== false;
    }
}

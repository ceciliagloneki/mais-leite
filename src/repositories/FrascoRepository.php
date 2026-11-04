<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Enums\EstadoFrascoEnum;
use MaisLeiteBackend\Enums\TipoFrascoEnum;
use MaisLeiteBackend\Models\Frasco;
use PDO;

final class FrascoRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(Frasco $frasco): int
    {
        $sql = "INSERT INTO frasco (tipo_frasco, volume_total, estado)
                VALUES (:tipo_frasco, :volume_total, :estado)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'tipo_frasco' => $frasco->tipoFrasco->value,
            'volume_total' => $frasco->volumeTotal,
            'estado' => $frasco->estado->value,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT * FROM frasco WHERE id = :id AND deleted_at IS NULL";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);

        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function findAll(?TipoFrascoEnum $tipoFrasco = null, ?EstadoFrascoEnum $estado = null): array
    {
        $sql = "SELECT * FROM frasco WHERE deleted_at IS NULL";

        $params = [];

        if ($tipoFrasco !== null) {
            $sql .= " AND tipo_frasco = :tipo_frasco";
            $params['tipo_frasco'] = $tipoFrasco->value;
        }

        if ($estado !== null) {
            $sql .= " AND estado = :estado";
            $params['estado'] = $estado->value;
        }

        $sql .= " ORDER BY id DESC";

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

        $sql = "UPDATE frasco SET " . implode(', ', $fields) . " WHERE id = :id AND deleted_at IS NULL";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete(int $id): bool
    {
        $sql = "UPDATE frasco SET deleted_at = NOW() WHERE id = :id AND deleted_at IS NULL";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    public function isLinkedToActiveRawMilk(int $id): bool
    {
        // A tabela frasco_leite_cru ainda não possui deleted_at, então todo registro é considerado ativo
        $sql = "SELECT frasco_id FROM frasco_leite_cru WHERE frasco_id = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch() !== false;
    }
}

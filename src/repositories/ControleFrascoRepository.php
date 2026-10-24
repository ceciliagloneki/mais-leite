<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Enums\TipoFrascoEnum;
use MaisLeiteBackend\Models\ControleFrasco;
use PDO;

final class ControleFrascoRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(ControleFrasco $controle): int
    {
        $sql = "INSERT INTO controle_frascos (visita_coleta_id, tipo_frasco, qtd_enviada, qtd_recebida)
                VALUES (:visita_coleta_id, :tipo_frasco, :qtd_enviada, :qtd_recebida)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'visita_coleta_id' => $controle->visitaColetaId,
            'tipo_frasco' => $controle->tipoFrasco->value,
            'qtd_enviada' => $controle->qtdEnviada,
            'qtd_recebida' => $controle->qtdRecebida,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT * FROM controle_frascos WHERE id = :id AND deleted_at IS NULL";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);

        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function findAll(?int $visitaColetaId = null): array
    {
        $sql = "SELECT * FROM controle_frascos WHERE deleted_at IS NULL";

        $params = [];

        if ($visitaColetaId !== null) {
            $sql .= " AND visita_coleta_id = :visita_coleta_id";
            $params['visita_coleta_id'] = $visitaColetaId;
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

        $sql = "UPDATE controle_frascos SET " . implode(', ', $fields) . " WHERE id = :id AND deleted_at IS NULL";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete(int $id): bool
    {
        $sql = "UPDATE controle_frascos SET deleted_at = NOW() WHERE id = :id AND deleted_at IS NULL";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    public function existsByVisitaAndTipo(int $visitaColetaId, TipoFrascoEnum $tipoFrasco, ?int $ignoreId = null): bool
    {
        $sql = "SELECT id FROM controle_frascos
                WHERE visita_coleta_id = :visita_coleta_id
                  AND tipo_frasco = :tipo_frasco
                  AND deleted_at IS NULL";

        $params = [
            'visita_coleta_id' => $visitaColetaId,
            'tipo_frasco' => $tipoFrasco->value,
        ];

        // Na atualização, o próprio registro não conta como duplicado
        if ($ignoreId !== null) {
            $sql .= " AND id <> :ignore_id";
            $params['ignore_id'] = $ignoreId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch() !== false;
    }

    public function visitaColetaExists(int $id): bool
    {
        $sql = "SELECT id FROM visita_coleta WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch() !== false;
    }
}

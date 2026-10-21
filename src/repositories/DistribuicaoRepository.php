<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Models\Distribuicao;
use PDO;

final class DistribuicaoRepository
{
    private PDO $db;

    public function __construct () {
        $this->db = Database::getConnection();
    }

    public function create (Distribuicao $distribuicao) : int {
        $sql = "INSERT INTO distribuicao (
                demanda_id,
                data,
                horario,
                assinatura_entrega,
                assinatura_recebimento)
                VALUES (
                :demanda_id,
                :data,
                :horario,
                :assinatura_entrega,
                :assinatura_recebimento)";

        $statement = $this->db->prepare($sql);
        $statement->execute([
            'demanda_id' => $distribuicao->demandaId,
            'data'       => $distribuicao->data,
            'horario'    => $distribuicao->horario,
            'assinatura_entrega'     => $distribuicao->assinaturaEntrega,
            'assinatura_recebimento' => $distribuicao->assinaturaRecebimento
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findById (int $id) : ?array {
        $sql = "SELECT id, demanda_id, data, horario, assinatura_entrega, assinatura_recebimento
                FROM distribuicao
                WHERE id = :id
                AND deleted_at IS NULL";

        $statement = $this->db->prepare($sql);
        $statement->execute(['id' => $id]);

        $res = $statement->fetch();
        return $res ?: null;
    }

    public function findAll (?int $demanda_id = null, ?string $data = null) :array {
        $sql = "SELECT id, demanda_id, data, hora, assinatura_entrega, assinatura_recebimento
                FROM distribuicao
                WHERE deleted_at IS NULL";

        $params = [];

        if ($demanda_id !== null) {
            $sql .= " AND demanda_id = :demanda_id";
            $params['demanda_id'] = $demanda_id;
        }

        if ($data !== null) {
            $sql .= " AND data = :data";
            $params['data'] = $data;
        }

        $sql .= " ORDER BY id ASC";

        $statement = $this->db->prepare($sql);
        $statement->execute($params);

        return $statement->fetchAll();
    }

    public function update (int $id, array $data) : bool {
        $fields = [];
        $params = ['id' => $id];

        foreach ($data as $key => $value) {
            $fields = "{$key} = :{$key}";
            $params[$key] = $value;
        }

        $sql = "UPDATE distribuicao SET " .
                implode(', ', $fields)    .
               " WHERE id = :id";

        $statement = $this->db->prepare($sql);
        return $statement->execute($params);
    }

    public function delete (int $id) : bool {
        $sql = "UPDATE distribuicao
                SET deleted_at = CURRENT_TIMESTAMP
                WHERE id = :id
                AND delete_at IS NULL";

        $statement = $this->db->prepare($sql);
        return $statement->execute(['id' => $id]);
    }

    public function demandaExists (int $id) : bool {
        $sql = "SELECT id from demanda
                WHERE id = :id
                AND status_solicitacao
                IN ('pendente', 'aprovada')";

        $statement = $this->db->prepare($sql);
        $statement->execute(['id' => $id]);

        return $statement->fetch() !== false;
    }
}
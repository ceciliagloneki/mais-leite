<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Models\Pasteurizacao;
use PDO;

final class PasteurizacaoRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(Pasteurizacao $pasteurizacao): int
    {
        $stmt = $this->db->prepare("INSERT INTO pasteurizacao (funcionario_id, data_pasteurizacao) VALUES (:funcionario_id, :data_pasteurizacao)");
        $stmt->execute([
            'funcionario_id' => $pasteurizacao->funcionarioId,
            'data_pasteurizacao' => $pasteurizacao->dataPasteurizacao,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM pasteurizacao WHERE id = :id");
        $stmt->execute(['id' => $id]);

        $result = $stmt->fetch();

        return $result ?: null;
    }

    public function findAll(): array
    {
        $sql = "SELECT p.id, p.data_pasteurizacao, f.nome AS funcionario_nome,
                       (SELECT COUNT(*) FROM frasco_leite_cru fc WHERE fc.pasteurizacao_id = p.id) AS quant_frascos_crus,
                       (SELECT COALESCE(SUM(fc.volume_ml), 0) FROM frasco_leite_cru fc WHERE fc.pasteurizacao_id = p.id) AS volume_cru,
                       (SELECT COUNT(*) FROM frasco_pasteurizado fp WHERE fp.pasteurizacao_id = p.id) AS quant_frascos_pasteurizados,
                       (SELECT COALESCE(SUM(fp.volume), 0) FROM frasco_pasteurizado fp WHERE fp.pasteurizacao_id = p.id) AS volume_reenvasado
                FROM pasteurizacao p
                INNER JOIN funcionario f ON f.id = p.funcionario_id
                ORDER BY p.id DESC";

        return $this->db->query($sql)->fetchAll();
    }
}

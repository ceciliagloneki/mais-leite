<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Models\Distribuicao;
use PDO;

final class DistribuicaoRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(Distribuicao $distribuicao): int
    {
        $sql = "INSERT INTO distribuicao (demanda_id, funcionario_id, data, horario, setor, volume_caixa, temperatura,
                    assinatura_entrega, assinatura_recebimento)
                VALUES (:demanda_id, :funcionario_id, :data, :horario, :setor, :volume_caixa, :temperatura,
                    :assinatura_entrega, :assinatura_recebimento)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'demanda_id' => $distribuicao->demandaId,
            'funcionario_id' => $distribuicao->funcionarioId,
            'data' => $distribuicao->data,
            'horario' => $distribuicao->horario,
            'setor' => $distribuicao->setor,
            'volume_caixa' => $distribuicao->volumeCaixa,
            'temperatura' => $distribuicao->temperatura,
            'assinatura_entrega' => $distribuicao->assinaturaEntrega,
            'assinatura_recebimento' => $distribuicao->assinaturaRecebimento,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT di.*, h.nome AS hospital_nome
                FROM distribuicao di
                INNER JOIN demanda d ON d.id = di.demanda_id
                INNER JOIN hospital h ON h.id = d.hospital_id
                WHERE di.id = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);

        $result = $stmt->fetch();

        return $result ?: null;
    }

    public function findAll(): array
    {
        $sql = "SELECT di.*, h.nome AS hospital_nome,
                       (SELECT COUNT(*) FROM frasco_distribuicao fd WHERE fd.distribuicao_id = di.id) AS quant_frascos
                FROM distribuicao di
                INNER JOIN demanda d ON d.id = di.demanda_id
                INNER JOIN hospital h ON h.id = d.hospital_id
                ORDER BY di.data DESC, di.id DESC";

        return $this->db->query($sql)->fetchAll();
    }
}

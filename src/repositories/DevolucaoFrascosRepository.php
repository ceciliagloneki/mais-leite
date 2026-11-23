<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Models\DevolucaoFrascos;
use PDO;

final class DevolucaoFrascosRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(DevolucaoFrascos $devolucao): int
    {
        $sql = "INSERT INTO devolucao_frascos (hospital_id, data, tipo_frasco, qtd_enviada, qtd_recebida)
                VALUES (:hospital_id, :data, :tipo_frasco, :qtd_enviada, :qtd_recebida)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'hospital_id' => $devolucao->hospitalId,
            'data' => $devolucao->data,
            'tipo_frasco' => $devolucao->tipoFrasco,
            'qtd_enviada' => $devolucao->qtdEnviada,
            'qtd_recebida' => $devolucao->qtdRecebida,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findAll(): array
    {
        $sql = "SELECT dv.*, (dv.qtd_enviada - dv.qtd_recebida) AS faltam, h.nome AS hospital_nome
                FROM devolucao_frascos dv
                INNER JOIN hospital h ON h.id = dv.hospital_id
                ORDER BY dv.data DESC, dv.id DESC";

        return $this->db->query($sql)->fetchAll();
    }
}

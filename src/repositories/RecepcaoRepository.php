<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Models\Recepcao;
use PDO;

final class RecepcaoRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(Recepcao $recepcao): int
    {
        $sql = "INSERT INTO recepcao (funcionario_id, zona_id, data, municipios, hora_saida, hora_chegada,
                    temperatura_caixa, quant_frascos, volume_total, conforme, motivo_descarte)
                VALUES (:funcionario_id, :zona_id, :data, :municipios, :hora_saida, :hora_chegada,
                    :temperatura_caixa, :quant_frascos, :volume_total, :conforme, :motivo_descarte)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'funcionario_id' => $recepcao->funcionarioId,
            'zona_id' => $recepcao->zonaId,
            'data' => $recepcao->data,
            'municipios' => $recepcao->municipios,
            'hora_saida' => $recepcao->horaSaida,
            'hora_chegada' => $recepcao->horaChegada,
            'temperatura_caixa' => $recepcao->temperaturaCaixa,
            'quant_frascos' => $recepcao->quantFrascos,
            'volume_total' => $recepcao->volumeTotal,
            'conforme' => (int) $recepcao->conforme,
            'motivo_descarte' => $recepcao->motivoDescarte,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findAll(): array
    {
        $sql = "SELECT r.*, z.nome AS zona_nome, f.nome AS funcionario_nome
                FROM recepcao r
                INNER JOIN zona z ON z.id = r.zona_id
                INNER JOIN funcionario f ON f.id = r.funcionario_id
                ORDER BY r.data DESC, r.id DESC";

        return $this->db->query($sql)->fetchAll();
    }
}

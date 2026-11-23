<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Models\Triagem;
use PDO;

final class TriagemRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(Triagem $triagem): int
    {
        $sql = "INSERT INTO triagem (doadora_id, funcionario_id, data_triagem, agua_potavel, esgoto, renda,
                    infeccao_urinaria, hipertensao, diabetes, hepatite, apgar_bebe, peso_bebe, malformacao_bebe,
                    equipamento_estocagem, produtos_junto_leite, conforme)
                VALUES (:doadora_id, :funcionario_id, :data_triagem, :agua_potavel, :esgoto, :renda,
                    :infeccao_urinaria, :hipertensao, :diabetes, :hepatite, :apgar_bebe, :peso_bebe, :malformacao_bebe,
                    :equipamento_estocagem, :produtos_junto_leite, :conforme)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'doadora_id' => $triagem->doadoraId,
            'funcionario_id' => $triagem->funcionarioId,
            'data_triagem' => $triagem->dataTriagem,
            'agua_potavel' => (int) $triagem->aguaPotavel,
            'esgoto' => (int) $triagem->esgoto,
            'renda' => $triagem->renda,
            'infeccao_urinaria' => (int) $triagem->infeccaoUrinaria,
            'hipertensao' => (int) $triagem->hipertensao,
            'diabetes' => (int) $triagem->diabetes,
            'hepatite' => (int) $triagem->hepatite,
            'apgar_bebe' => $triagem->apgarBebe,
            'peso_bebe' => $triagem->pesoBebe,
            'malformacao_bebe' => (int) $triagem->malformacaoBebe,
            'equipamento_estocagem' => $triagem->equipamentoEstocagem,
            'produtos_junto_leite' => $triagem->produtosJuntoLeite,
            'conforme' => (int) $triagem->conforme,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findByDoadora(int $doadoraId): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM triagem WHERE doadora_id = :doadora_id");
        $stmt->execute(['doadora_id' => $doadoraId]);

        $result = $stmt->fetch();

        return $result ?: null;
    }
}

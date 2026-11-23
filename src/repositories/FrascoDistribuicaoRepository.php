<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Models\FrascoDistribuicao;
use PDO;

final class FrascoDistribuicaoRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(FrascoDistribuicao $alocacao): int
    {
        $stmt = $this->db->prepare("INSERT INTO frasco_distribuicao (prescricao_id, frasco_pasteurizado_id) VALUES (:prescricao_id, :frasco_id)");
        $stmt->execute([
            'prescricao_id' => $alocacao->prescricaoId,
            'frasco_id' => $alocacao->frascoPasteurizadoId,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM frasco_distribuicao WHERE id = :id");
        $stmt->execute(['id' => $id]);

        $result = $stmt->fetch();

        return $result ?: null;
    }

    public function findAll(?int $distribuicaoId = null): array
    {
        $sql = "SELECT fd.id, fd.prescricao_id, fd.frasco_pasteurizado_id, fd.distribuicao_id, fd.data_administracao,
                       fp.volume, fp.classificacao, fp.status AS frasco_status, fp.doadora_id,
                       p.nome_do_rn, p.tipo_leite, p.demanda_id, h.nome AS hospital_nome
                FROM frasco_distribuicao fd
                INNER JOIN frasco_pasteurizado fp ON fp.id = fd.frasco_pasteurizado_id
                INNER JOIN prescricao p ON p.id = fd.prescricao_id
                INNER JOIN demanda d ON d.id = p.demanda_id
                INNER JOIN hospital h ON h.id = d.hospital_id";

        $params = [];

        if ($distribuicaoId !== null) {
            $sql .= " WHERE fd.distribuicao_id = :distribuicao_id";
            $params['distribuicao_id'] = $distribuicaoId;
        }

        $sql .= " ORDER BY fd.id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    public function findProntosParaDistribuir(int $demandaId): array
    {
        $sql = "SELECT fd.id, fd.frasco_pasteurizado_id
                FROM frasco_distribuicao fd
                INNER JOIN prescricao p ON p.id = fd.prescricao_id
                INNER JOIN frasco_pasteurizado fp ON fp.id = fd.frasco_pasteurizado_id
                WHERE p.demanda_id = :demanda_id AND fd.distribuicao_id IS NULL AND fp.status = 'alocado'";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['demanda_id' => $demandaId]);

        return $stmt->fetchAll();
    }

    public function registrarDistribuicao(int $id, int $distribuicaoId): bool
    {
        $stmt = $this->db->prepare("UPDATE frasco_distribuicao SET distribuicao_id = :distribuicao_id WHERE id = :id");

        return $stmt->execute(['id' => $id, 'distribuicao_id' => $distribuicaoId]);
    }

    public function registrarAdministracao(int $id, string $dataAdministracao): bool
    {
        $stmt = $this->db->prepare("UPDATE frasco_distribuicao SET data_administracao = :data WHERE id = :id");

        return $stmt->execute(['id' => $id, 'data' => $dataAdministracao]);
    }
}

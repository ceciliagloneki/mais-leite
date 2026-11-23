<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Enums\StatusFrascoPasteurizadoEnum;
use MaisLeiteBackend\Models\FrascoPasteurizado;
use PDO;

final class FrascoPasteurizadoRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(FrascoPasteurizado $frasco): int
    {
        $sql = "INSERT INTO frasco_pasteurizado (pasteurizacao_id, doadora_id, volume, classificacao, data_pasteurizacao)
                VALUES (:pasteurizacao_id, :doadora_id, :volume, :classificacao, :data_pasteurizacao)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'pasteurizacao_id' => $frasco->pasteurizacaoId,
            'doadora_id' => $frasco->doadoraId,
            'volume' => $frasco->volume,
            'classificacao' => $frasco->classificacao,
            'data_pasteurizacao' => $frasco->dataPasteurizacao,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM frasco_pasteurizado WHERE id = :id");
        $stmt->execute(['id' => $id]);

        $result = $stmt->fetch();

        return $result ?: null;
    }

    public function findAll(?string $status = null): array
    {
        $sql = "SELECT fp.*, a.crematocrito_tc, a.crematocrito_tg, a.crematocrito_e, a.dornic, a.bgbl,
                       a.temperatura, a.data_analise, a.aprovado
                FROM frasco_pasteurizado fp
                LEFT JOIN analise_fisico_quimica a ON a.frasco_pasteurizado_id = fp.id";

        $params = [];

        if ($status !== null) {
            $sql .= " WHERE fp.status = :status";
            $params['status'] = $status;
        }

        $sql .= " ORDER BY fp.id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    public function volumeReenvasado(int $pasteurizacaoId, int $doadoraId): float
    {
        $sql = "SELECT COALESCE(SUM(volume), 0) FROM frasco_pasteurizado
                WHERE pasteurizacao_id = :pasteurizacao_id AND doadora_id = :doadora_id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['pasteurizacao_id' => $pasteurizacaoId, 'doadora_id' => $doadoraId]);

        return (float) $stmt->fetchColumn();
    }

    public function updateStatus(int $id, string $status): bool
    {
        $stmt = $this->db->prepare("UPDATE frasco_pasteurizado SET status = :status WHERE id = :id");

        return $stmt->execute(['id' => $id, 'status' => $status]);
    }

    public function bloquearDaDoadora(int $doadoraId): void
    {
        $sql = "UPDATE frasco_pasteurizado SET status = :bloqueado
                WHERE doadora_id = :doadora_id AND status IN (:quarentena, :disponivel, :alocado)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'doadora_id' => $doadoraId,
            'bloqueado' => StatusFrascoPasteurizadoEnum::BLOQUEADO->value,
            'quarentena' => StatusFrascoPasteurizadoEnum::QUARENTENA->value,
            'disponivel' => StatusFrascoPasteurizadoEnum::DISPONIVEL->value,
            'alocado' => StatusFrascoPasteurizadoEnum::ALOCADO->value,
        ]);
    }
}

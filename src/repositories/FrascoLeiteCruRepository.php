<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Enums\StatusFrascoCruEnum;
use MaisLeiteBackend\Models\FrascoLeiteCru;
use PDO;

final class FrascoLeiteCruRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(FrascoLeiteCru $frasco): int
    {
        $sql = "INSERT INTO frasco_leite_cru (visita_coleta_id, data_hora_primeira_coleta, volume_ml, forma_extracao,
                    cond_prestocagem, estado, classificacao, data, responsavel)
                VALUES (:visita_coleta_id, :data_hora_primeira_coleta, :volume_ml, :forma_extracao,
                    :cond_prestocagem, :estado, :classificacao, :data, :responsavel)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'visita_coleta_id' => $frasco->visitaColetaId,
            'data_hora_primeira_coleta' => $frasco->dataHoraPrimeiraColeta,
            'volume_ml' => $frasco->volumeMl,
            'forma_extracao' => $frasco->formaExtracao,
            'cond_prestocagem' => $frasco->condPrestocagem,
            'estado' => $frasco->estado,
            'classificacao' => $frasco->classificacao,
            'data' => $frasco->data,
            'responsavel' => $frasco->responsavel,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findAll(?string $status = null): array
    {
        $sql = "SELECT fc.*, vc.doadora_id, d.nome AS doadora_nome, d.data_nasc AS doadora_data_nasc, d.zona_id
                FROM frasco_leite_cru fc
                INNER JOIN visita_coleta vc ON vc.id = fc.visita_coleta_id
                INNER JOIN doadora d ON d.id = vc.doadora_id";

        $params = [];

        if ($status !== null) {
            $sql .= " WHERE fc.status = :status";
            $params['status'] = $status;
        }

        $sql .= " ORDER BY fc.id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    public function findByIds(array $ids): array
    {
        $placeholders = implode(',', array_fill(0, count($ids), '?'));

        $sql = "SELECT fc.*, vc.doadora_id, d.zona_id
                FROM frasco_leite_cru fc
                INNER JOIN visita_coleta vc ON vc.id = fc.visita_coleta_id
                INNER JOIN doadora d ON d.id = vc.doadora_id
                WHERE fc.id IN ({$placeholders})";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($ids);

        return $stmt->fetchAll();
    }

    public function findByPasteurizacao(int $pasteurizacaoId): array
    {
        $sql = "SELECT fc.*, vc.doadora_id
                FROM frasco_leite_cru fc
                INNER JOIN visita_coleta vc ON vc.id = fc.visita_coleta_id
                WHERE fc.pasteurizacao_id = :pasteurizacao_id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['pasteurizacao_id' => $pasteurizacaoId]);

        return $stmt->fetchAll();
    }

    public function registrarRecepcao(array $ids, int $recepcaoId, string $status): void
    {
        $stmt = $this->db->prepare("UPDATE frasco_leite_cru SET recepcao_id = :recepcao_id, status = :status WHERE id = :id");

        foreach ($ids as $id) {
            $stmt->execute(['id' => $id, 'recepcao_id' => $recepcaoId, 'status' => $status]);
        }
    }

    public function registrarPasteurizacao(array $ids, int $pasteurizacaoId): void
    {
        $stmt = $this->db->prepare("UPDATE frasco_leite_cru SET pasteurizacao_id = :pasteurizacao_id, status = :status WHERE id = :id");

        foreach ($ids as $id) {
            $stmt->execute([
                'id' => $id,
                'pasteurizacao_id' => $pasteurizacaoId,
                'status' => StatusFrascoCruEnum::PASTEURIZADO->value,
            ]);
        }
    }

    public function descartarDaDoadora(int $doadoraId): void
    {
        $sql = "UPDATE frasco_leite_cru fc
                INNER JOIN visita_coleta vc ON vc.id = fc.visita_coleta_id
                SET fc.status = :descartado
                WHERE vc.doadora_id = :doadora_id AND fc.status IN (:coletado, :conforme)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'doadora_id' => $doadoraId,
            'descartado' => StatusFrascoCruEnum::DESCARTADO->value,
            'coletado' => StatusFrascoCruEnum::COLETADO->value,
            'conforme' => StatusFrascoCruEnum::CONFORME->value,
        ]);
    }
}

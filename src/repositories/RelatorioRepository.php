<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use PDO;

final class RelatorioRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function doadorasPorStatus(): array
    {
        return $this->db->query("SELECT status, COUNT(*) AS total FROM doadora GROUP BY status")->fetchAll();
    }

    public function frascosCrusPorStatus(): array
    {
        $sql = "SELECT status, COUNT(*) AS total, COALESCE(SUM(volume_ml), 0) AS volume
                FROM frasco_leite_cru GROUP BY status";

        return $this->db->query($sql)->fetchAll();
    }

    public function estoquePasteurizado(): array
    {
        $sql = "SELECT status, classificacao, COUNT(*) AS total, COALESCE(SUM(volume), 0) AS volume
                FROM frasco_pasteurizado
                GROUP BY status, classificacao
                ORDER BY status, classificacao";

        return $this->db->query($sql)->fetchAll();
    }

    public function devolucoesPendentes(): array
    {
        $sql = "SELECT h.nome AS hospital_nome, dv.tipo_frasco, SUM(dv.qtd_enviada) AS enviados,
                       SUM(dv.qtd_recebida) AS recebidos, SUM(dv.qtd_enviada - dv.qtd_recebida) AS faltam
                FROM devolucao_frascos dv
                INNER JOIN hospital h ON h.id = dv.hospital_id
                GROUP BY h.nome, dv.tipo_frasco
                HAVING faltam > 0";

        return $this->db->query($sql)->fetchAll();
    }

    public function frascoPasteurizado(int $id): ?array
    {
        $sql = "SELECT fp.*, p.data_pasteurizacao AS data_processo
                FROM frasco_pasteurizado fp
                INNER JOIN pasteurizacao p ON p.id = fp.pasteurizacao_id
                WHERE fp.id = :id";

        return $this->fetchOne($sql, ['id' => $id]);
    }

    public function doadora(int $id): ?array
    {
        return $this->fetchOne("SELECT id, nome, data_parto, status FROM doadora WHERE id = :id", ['id' => $id]);
    }

    public function sorologias(int $doadoraId): array
    {
        return $this->fetchAll(
            "SELECT numero_amostra, data_coleta, resultado FROM sorologia WHERE doadora_id = :id ORDER BY numero_amostra",
            ['id' => $doadoraId]
        );
    }

    public function frascosCrus(int $pasteurizacaoId, int $doadoraId): array
    {
        $sql = "SELECT fc.id, fc.data_hora_primeira_coleta, fc.volume_ml, fc.classificacao, fc.recepcao_id
                FROM frasco_leite_cru fc
                INNER JOIN visita_coleta vc ON vc.id = fc.visita_coleta_id
                WHERE fc.pasteurizacao_id = :pasteurizacao_id AND vc.doadora_id = :doadora_id";

        return $this->fetchAll($sql, ['pasteurizacao_id' => $pasteurizacaoId, 'doadora_id' => $doadoraId]);
    }

    public function analise(int $frascoId): ?array
    {
        return $this->fetchOne("SELECT * FROM analise_fisico_quimica WHERE frasco_pasteurizado_id = :id", ['id' => $frascoId]);
    }

    public function destino(int $frascoId): ?array
    {
        $sql = "SELECT p.nome_do_rn, p.tipo_leite, p.volume_prescrito, fd.data_administracao, fd.distribuicao_id,
                       h.nome AS hospital_nome, di.data AS data_entrega, di.setor
                FROM frasco_distribuicao fd
                INNER JOIN prescricao p ON p.id = fd.prescricao_id
                INNER JOIN demanda d ON d.id = p.demanda_id
                INNER JOIN hospital h ON h.id = d.hospital_id
                LEFT JOIN distribuicao di ON di.id = fd.distribuicao_id
                WHERE fd.frasco_pasteurizado_id = :id";

        return $this->fetchOne($sql, ['id' => $frascoId]);
    }

    private function fetchOne(string $sql, array $params): ?array
    {
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        $result = $stmt->fetch();

        return $result ?: null;
    }

    private function fetchAll(string $sql, array $params): array
    {
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }
}

<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Models\ColetaDomiciliar;
use PDO;

final class ColetaDomiciliarRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(ColetaDomiciliar $coleta): int
    {
        $sql = "INSERT INTO visita_coleta (doadora_id, funcionario_id, data, data_coleta_sangue, frascos_novos, frascos_esterilizados, status)
                VALUES (:doadora_id, :funcionario_id, :data, :data_coleta_sangue, :frascos_novos, :frascos_esterilizados, :status)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'doadora_id' => $coleta->doadoraId,
            'funcionario_id' => $coleta->funcionarioId,
            'data' => $coleta->data,
            'data_coleta_sangue' => $coleta->dataColetaSangue,
            'frascos_novos' => $coleta->frascosNovos,
            'frascos_esterilizados' => $coleta->frascosEsterilizados,
            'status' => $coleta->status,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function realizar(int $id, int $funcionarioId, string $data, ?string $dataColetaSangue, int $frascosNovos, int $frascosEsterilizados, int $frascosRecebidos = 0): bool
    {
        $sql = "UPDATE visita_coleta
                SET status = 'realizada', funcionario_id = :funcionario_id, data = :data, data_coleta_sangue = :data_coleta_sangue,
                    frascos_novos = :frascos_novos, frascos_esterilizados = :frascos_esterilizados,
                    frascos_recebidos = :frascos_recebidos
                WHERE id = :id";

        return $this->db->prepare($sql)->execute([
            'id' => $id,
            'funcionario_id' => $funcionarioId,
            'data' => $data,
            'data_coleta_sangue' => $dataColetaSangue,
            'frascos_novos' => $frascosNovos,
            'frascos_esterilizados' => $frascosEsterilizados,
            'frascos_recebidos' => $frascosRecebidos,
        ]);
    }

    public function updateStatus(int $id, string $status): bool
    {
        return $this->db->prepare("UPDATE visita_coleta SET status = :status WHERE id = :id")->execute(['id' => $id, 'status' => $status]);
    }

    public function agendadaExists(int $doadoraId, string $data): bool
    {
        $stmt = $this->db->prepare(
            "SELECT COUNT(*) FROM visita_coleta WHERE doadora_id = :doadora_id AND data = :data AND status = 'agendada'"
        );
        $stmt->execute(['doadora_id' => $doadoraId, 'data' => $data]);

        return (int) $stmt->fetchColumn() > 0;
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT vc.*, d.nome AS doadora_nome, d.status AS doadora_status, d.data_parto
                FROM visita_coleta vc
                INNER JOIN doadora d ON d.id = vc.doadora_id
                WHERE vc.id = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);

        $result = $stmt->fetch();

        return $result ?: null;
    }

    public function findAll(): array
    {
        $sql = "SELECT vc.id, vc.data, vc.doadora_id, d.nome AS doadora_nome, z.nome AS zona_nome, z.dia_da_semana,
                       vc.data_coleta_sangue, vc.frascos_novos, vc.frascos_esterilizados, vc.frascos_recebidos, vc.status, d.status AS doadora_status,
                       d.telefone, d.endereco_rua, d.endereco_numero, d.endereco_bairro, d.data_parto,
                       t.equipamento_estocagem,
                       f.nome AS funcionario_nome,
                       COUNT(fc.id) AS quant_frascos, COALESCE(SUM(fc.volume_ml), 0) AS volume_doado
                FROM visita_coleta vc
                INNER JOIN doadora d ON d.id = vc.doadora_id
                INNER JOIN zona z ON z.id = d.zona_id
                INNER JOIN funcionario f ON f.id = vc.funcionario_id
                LEFT JOIN triagem t ON t.doadora_id = d.id
                LEFT JOIN frasco_leite_cru fc ON fc.visita_coleta_id = vc.id
                GROUP BY vc.id
                ORDER BY vc.data DESC, vc.id DESC";

        return $this->db->query($sql)->fetchAll();
    }
}

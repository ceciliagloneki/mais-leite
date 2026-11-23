<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Models\AnaliseFisicoQuimica;
use PDO;

final class AnaliseFisicoQuimicaRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(AnaliseFisicoQuimica $analise): int
    {
        $sql = "INSERT INTO analise_fisico_quimica (frasco_pasteurizado_id, crematocrito_tc, crematocrito_tg,
                    crematocrito_e, dornic, bgbl, temperatura, data_analise, aprovado)
                VALUES (:frasco_pasteurizado_id, :crematocrito_tc, :crematocrito_tg,
                    :crematocrito_e, :dornic, :bgbl, :temperatura, :data_analise, :aprovado)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'frasco_pasteurizado_id' => $analise->frascoPasteurizadoId,
            'crematocrito_tc' => $analise->crematocritoTc,
            'crematocrito_tg' => $analise->crematocritoTg,
            'crematocrito_e' => $analise->crematocritoE,
            'dornic' => $analise->dornic,
            'bgbl' => $analise->bgbl,
            'temperatura' => $analise->temperatura,
            'data_analise' => $analise->dataAnalise,
            'aprovado' => (int) $analise->aprovado,
        ]);

        return (int) $this->db->lastInsertId();
    }
}

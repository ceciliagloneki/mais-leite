<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Demandas;

final class DemandaResponseDTO
{
    public static function fromArray(array $data) : array {
        return [
            'id' => (int) $data['id'],
            'hospital' => [
                'id'   => (int) $data['hospital_id'],
                'nome' => $data['hospital_nome']
            ],
            'volume_total'       => number_format((float) $data['volume_total'], 2),
            'numero_de_bebes'    => $data['numero_de_bebes'],
            'data_demanda'       => $data['data_demanda'],
            'status_solicitacao' => $data['status_solicitacao']
        ];
    }
}
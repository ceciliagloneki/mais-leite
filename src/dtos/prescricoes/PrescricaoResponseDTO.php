<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Prescricoes;

final class PrescricaoResponseDTO
{
    public static function fromArray(array $data) : array {
        return [
            'id' => (int) $data['id'],
            'demanda_id' => (int) $data['demanda_id'],
            'volume_prescrito' => number_format((float) $data['volume_prescrito'], 2),
            'nome_do_rn' => $data['nome_do_rn'],
            'tipo_leite' => $data['tipo_leite']
        ];
    }
}
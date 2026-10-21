<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Distribuicoes;

final class DistribuicaoResponseDTO
{
    public static function fromArray (array $data) : array {
        return [
            'id' => (int) $data['id'],
            'demanda_id' => (int) $data['demanda_id'],
            'data' => $data['data'],
            'horario' => $data['horario'],
            'assinatura_entrega' => $data['assinatura_entrega'],
            'assinatura_recebimento' => $data['assinatura_recebimento']
        ];
    }
}
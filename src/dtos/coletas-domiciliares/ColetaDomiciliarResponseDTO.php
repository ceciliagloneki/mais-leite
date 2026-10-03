<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\ColetasDomiciliares;

final class ColetaDomiciliarResponseDTO
{
    public static function fromArray(array $data): array
    {
        return [
            'id' => (int) $data['id'],
            'funcionario' => [
                'id' => (int) $data['funcionario_id'],
                'nome' => $data['funcionario_nome'],
            ],
            'doadora' => [
                'id' => (int) $data['doadora_id'],
                'nome' => $data['doadora_nome'],
            ],
            'data' => $data['data'],
            'hora_coleta' => $data['hora_coleta'],
            'volume_doado' => $data['volume_doado'] !== null ? (float) $data['volume_doado'] : null,
            'status' => $data['status'],
        ];
    }
}

<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Frascos;

final class FrascoResponseDTO
{
    public static function fromArray(array $data): array
    {
        return [
            'id' => (int) $data['id'],
            'tipo_frasco' => $data['tipo_frasco'],
            'volume_total' => round((float) $data['volume_total'], 2),
            'estado' => $data['estado'],
        ];
    }
}

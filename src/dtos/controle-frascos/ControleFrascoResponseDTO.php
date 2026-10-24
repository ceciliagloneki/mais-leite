<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\ControleFrascos;

final class ControleFrascoResponseDTO
{
    public static function fromArray(array $data): array
    {
        return [
            'id' => (int) $data['id'],
            'visita_coleta_id' => (int) $data['visita_coleta_id'],
            'tipo_frasco' => $data['tipo_frasco'],
            'qtd_enviada' => (int) $data['qtd_enviada'],
            'qtd_recebida' => (int) $data['qtd_recebida'],
        ];
    }
}

<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\ColetasDomiciliares;

final class ColetaDomiciliarListResponseDTO
{
    public static function fromArray(array $coletas): array
    {
        return array_map(
            fn(array $coleta) => ColetaDomiciliarResponseDTO::fromArray($coleta),
            $coletas
        );
    }
}

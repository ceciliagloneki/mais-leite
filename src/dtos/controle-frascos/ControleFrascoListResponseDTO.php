<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\ControleFrascos;

final class ControleFrascoListResponseDTO
{
    public static function fromArray(array $controles): array
    {
        return array_map(
            fn(array $controle) => ControleFrascoResponseDTO::fromArray($controle),
            $controles
        );
    }
}

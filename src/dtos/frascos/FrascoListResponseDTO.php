<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Frascos;

final class FrascoListResponseDTO
{
    public static function fromArray(array $frascos): array
    {
        return array_map(
            fn(array $frasco) => FrascoResponseDTO::fromArray($frasco),
            $frascos
        );
    }
}

<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Demandas;

final class  DemandaListResponseDTO
{
    public static function fromArray(array $demandas) : array {
        return array_map(
            fn(array $demanda) => DemandaListResponseDTO::fromArray($demanda), $demandas
        );
    }
}
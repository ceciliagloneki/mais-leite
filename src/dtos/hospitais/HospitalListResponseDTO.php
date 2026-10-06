<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Hospitais;

final class HospitalListResponseDTO
{
    public static function fromArray(array $hospitais) : array {
        return array_map(
            fn(array $hospital) => HospitalResponseDTO::fromArray($hospital), $hospitais
        );
    }
}
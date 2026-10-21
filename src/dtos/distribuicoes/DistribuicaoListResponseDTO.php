<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Distribuicoes;

final class DistribuicaoListResponseDTO
{
    public static function fromArray(array $distribuicoes) : array {
        return array_map(
            fn(array $distribuicao) => DistribuicaoResponseDTO::fromArray($distribuicao), $distribuicoes  
        );
    }
}
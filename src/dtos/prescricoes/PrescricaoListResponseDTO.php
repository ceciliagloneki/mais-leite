<?php 

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Prescricoes;

final class PrescricaoListResponseDTO
{
    public static function fromArray(array $prescricoes) : array {
        return array_map(
            fn(array $prescricao) => PrescricaoResponseDTO::fromArray($prescricao), $prescricoes
        );
    }
}
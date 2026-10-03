<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Funcionarios;

final class FuncionarioListResponseDTO
{
    public static function fromArray(array $funcionarios): array
    {
        return array_map(
            fn(array $funcionario) => FuncionarioResponseDTO::fromArray($funcionario),
            $funcionarios
        );
    }
}

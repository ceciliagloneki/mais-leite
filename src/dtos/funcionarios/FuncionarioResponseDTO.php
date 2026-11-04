<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Funcionarios;

final class FuncionarioResponseDTO
{
    public static function fromArray(array $data): array
    {
        return [
            'id' => (int) $data['id'],
            'nome' => $data['nome'],
            'cargo' => $data['cargo'],
            'email' => $data['email'],
            'status' => $data['status'],
        ];
    }
}

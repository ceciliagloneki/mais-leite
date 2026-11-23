<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Auth;

final class LoginResponseDTO
{
    public static function fromFuncionario(array $funcionario, string $token): array
    {
        return [
            'token' => $token,
            'funcionario' => [
                'id' => (int) $funcionario['id'],
                'nome' => $funcionario['nome'],
                'cargo' => $funcionario['cargo'],
                'email' => $funcionario['email'],
                'status' => $funcionario['status'],
            ],
        ];
    }
}

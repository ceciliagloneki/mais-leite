<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Auth;

final class LoginResponseDTO
{
    public static function fromArray(array $funcionario, string $token, string $tokenType = 'Bearer'): array
    {
        return [
            'token' => $token,
            'token_type' => $tokenType,
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

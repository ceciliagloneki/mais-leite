<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Auth;

use InvalidArgumentException;

final class LoginDTO
{
    public readonly string $email;
    public readonly string $senha;

    public function __construct(array $data)
    {
        $email = trim((string) ($data['email'] ?? $data['usuario'] ?? ''));
        $senha = (string) ($data['senha'] ?? '');

        if ($email === '') {
            throw new InvalidArgumentException('E-mail é obrigatório.');
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('E-mail inválido.');
        }
        if ($senha === '') {
            throw new InvalidArgumentException('Senha é obrigatória.');
        }

        $this->email = strtolower($email);
        $this->senha = $senha;
    }
}

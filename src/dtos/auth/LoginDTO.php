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
        $this->validateRequired($data);

        $this->email = $this->validateEmail($data['email']);
        $this->senha = (string) $data['senha'];
    }

    private function validateRequired(array $data): void
    {
        $required = ['email', 'senha'];

        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                throw new InvalidArgumentException("Campo '{$field}' é obrigatório.");
            }
        }
    }

    private function validateEmail(string $email): string
    {
        $email = strtolower(trim($email));

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException("E-mail inválido.");
        }

        return $email;
    }
}

<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Funcionarios;

use InvalidArgumentException;

final class CreateFuncionarioDTO
{
    public readonly string $nome;
    public readonly string $cargo;
    public readonly string $email;
    public readonly string $senha;

    public function __construct(array $data)
    {
        $this->validateRequired($data);

        $this->nome = $this->validateNome($data['nome']);
        $this->cargo = $this->validateCargo($data['cargo']);
        $this->email = $this->validateEmail($data['email']);
        $this->senha = $this->validateSenha($data['senha']);
    }

    private function validateRequired(array $data): void
    {
        $required = ['nome', 'cargo', 'email', 'senha'];

        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                throw new InvalidArgumentException("Campo '{$field}' é obrigatório.");
            }
        }
    }

    private function validateNome(string $nome): string
    {
        $nome = trim($nome);

        if ($nome === '') {
            throw new InvalidArgumentException("Nome é obrigatório.");
        }

        return $nome;
    }

    private function validateCargo(string $cargo): string
    {
        $cargo = trim($cargo);

        if ($cargo === '') {
            throw new InvalidArgumentException("Cargo é obrigatório.");
        }

        return $cargo;
    }

    private function validateEmail(string $email): string
    {
        $email = strtolower(trim($email));

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException("E-mail inválido.");
        }

        return $email;
    }

    private function validateSenha(string $senha): string
    {
        if (strlen($senha) < 6) {
            throw new InvalidArgumentException("A senha deve possuir pelo menos 6 caracteres.");
        }

        if (!preg_match('/[A-Z]/', $senha)) {
            throw new InvalidArgumentException("A senha deve possuir pelo menos uma letra maiúscula.");
        }

        if (!preg_match('/[a-z]/', $senha)) {
            throw new InvalidArgumentException("A senha deve possuir pelo menos uma letra minúscula.");
        }

        if (!preg_match('/[0-9]/', $senha)) {
            throw new InvalidArgumentException("A senha deve possuir pelo menos um número.");
        }

        if (!preg_match('/[^a-zA-Z0-9]/', $senha)) {
            throw new InvalidArgumentException("A senha deve possuir pelo menos um caractere especial.");
        }

        return password_hash($senha, PASSWORD_DEFAULT);
    }
}

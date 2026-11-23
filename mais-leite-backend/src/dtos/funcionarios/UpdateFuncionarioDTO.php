<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Funcionarios;

use InvalidArgumentException;

final class UpdateFuncionarioDTO
{
    public readonly ?string $nome;
    public readonly ?string $cargo;
    public readonly ?string $email;
    public readonly ?string $senha;

    public function __construct(array $data)
    {
        $this->validateAllowedFields($data);

        $this->nome = isset($data['nome']) ? $this->validateNome($data['nome']) : null;
        $this->cargo = isset($data['cargo']) ? $this->validateCargo($data['cargo']) : null;
        $this->email = isset($data['email']) ? $this->validateEmail($data['email']) : null;
        $this->senha = isset($data['senha']) ? $this->validateSenha($data['senha']) : null;
    }

    private function validateAllowedFields(array $data): void
    {
        $notAllowed = ['id', 'status'];

        foreach ($notAllowed as $field) {
            if (isset($data[$field])) {
                throw new InvalidArgumentException("Campo '{$field}' não pode ser alterado.");
            }
        }

        if (empty($data)) {
            throw new InvalidArgumentException("Nenhum campo para atualizar.");
        }
    }

    private function validateNome(string $nome): string
    {
        $nome = trim($nome);

        if ($nome === '') {
            throw new InvalidArgumentException("Nome não pode ser vazio.");
        }

        return $nome;
    }

    private function validateCargo(string $cargo): string
    {
        $cargo = trim($cargo);

        if ($cargo === '') {
            throw new InvalidArgumentException("Cargo não pode ser vazio.");
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

        return $senha;
    }

    public function toArray(): array
    {
        $data = [];

        if ($this->nome !== null) {
            $data['nome'] = $this->nome;
        }

        if ($this->cargo !== null) {
            $data['cargo'] = $this->cargo;
        }

        if ($this->email !== null) {
            $data['email'] = $this->email;
        }

        if ($this->senha !== null) {
            $data['senha'] = password_hash($this->senha, PASSWORD_DEFAULT);
        }

        return $data;
    }
}

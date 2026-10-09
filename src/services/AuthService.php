<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Services;

use MaisLeiteBackend\Dtos\Auth\LoginDTO;
use MaisLeiteBackend\Dtos\Auth\LoginResponseDTO;
use MaisLeiteBackend\Enums\StatusEnum;
use MaisLeiteBackend\Repositories\FuncionarioRepository;
use MaisLeiteBackend\Utils\Jwt;
use InvalidArgumentException;

final class AuthService
{
    public function __construct(
        private readonly FuncionarioRepository $repository
    ) {}

    public function login(LoginDTO $dto): array
    {
        $funcionario = $this->repository->findByEmail($dto->email);

        if ($funcionario === null) {
            throw new InvalidArgumentException("E-mail ou senha inválidos.");
        }

        if ($funcionario['status'] === StatusEnum::INATIVO->value) {
            throw new InvalidArgumentException("Funcionário inativo. Acesso não permitido.");
        }

        if (!password_verify($dto->senha, (string) $funcionario['senha'])) {
            throw new InvalidArgumentException("E-mail ou senha inválidos.");
        }

        $token = Jwt::encode([
            'sub' => (int) $funcionario['id'],
            'email' => $funcionario['email'],
            'cargo' => $funcionario['cargo'],
        ]);

        return LoginResponseDTO::fromArray($funcionario, $token);
    }
}

<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Services;

use MaisLeiteBackend\Dtos\Funcionarios\CreateFuncionarioDTO;
use MaisLeiteBackend\Dtos\Funcionarios\UpdateFuncionarioDTO;
use MaisLeiteBackend\Enums\StatusEnum;
use MaisLeiteBackend\Models\Funcionario;
use MaisLeiteBackend\Repositories\FuncionarioRepository;
use InvalidArgumentException;

final class FuncionarioService
{
    public function __construct(
        private readonly FuncionarioRepository $repository
    ) {}

    public function create(CreateFuncionarioDTO $dto): int
    {
        if ($this->repository->findByEmail($dto->email) !== null) {
            throw new InvalidArgumentException("E-mail já cadastrado.");
        }

        $funcionario = new Funcionario(
            id: null,
            nome: $dto->nome,
            cargo: $dto->cargo,
            email: $dto->email,
            senha: $dto->senha,
            status: StatusEnum::ATIVO->value
        );

        return $this->repository->create($funcionario);
    }

    public function findById(int $id): ?array
    {
        return $this->repository->findById($id);
    }

    public function findAll(?string $status = null): array
    {
        $statusEnum = null;

        if ($status !== null && $status !== 'todos') {
            $statusEnum = StatusEnum::tryFrom($status);

            if ($statusEnum === null) {
                throw new InvalidArgumentException("Status inválido. Use: ativo, inativo ou todos.");
            }
        }

        return $this->repository->findAll($statusEnum);
    }

    public function update(int $id, UpdateFuncionarioDTO $dto): bool
    {
        $funcionario = $this->repository->findById($id);

        if ($funcionario === null) {
            throw new InvalidArgumentException("Funcionário não encontrado.");
        }

        if ($funcionario['status'] === StatusEnum::INATIVO->value) {
            throw new InvalidArgumentException("Funcionário está inativo.");
        }

        if ($dto->email !== null) {
            $existente = $this->repository->findByEmail($dto->email);

            if ($existente !== null && (int) $existente['id'] !== $id) {
                throw new InvalidArgumentException("E-mail já cadastrado.");
            }
        }

        $data = $dto->toArray();

        if ($data === []) {
            return true;
        }

        return $this->repository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        $funcionario = $this->repository->findById($id);

        if ($funcionario === null) {
            throw new InvalidArgumentException("Funcionário não encontrado.");
        }

        if ($funcionario['status'] === StatusEnum::INATIVO->value) {
            throw new InvalidArgumentException("Funcionário já está inativo.");
        }

        return $this->repository->delete($id);
    }
}

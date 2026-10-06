<?php

declare(strict_type=1);

namespace MaisLeiteBackend\Services;

use MaisLeiteBackend\Dtos\Hospital\CreateHospitalDTO;
use MaisLeiteBackend\Dtos\Hospital\UpdateHospitalDTO;
use MaisLeiteBackend\Enums\StatusEnum;
use MaisLeiteBackend\Models\Hospital;
use MaisLeiteBackend\Repositories\HospitalRepository;

use InvalidArgumentException;


final class HospitalService
{
    public function __construct(
        private readonly HospitalRepository $repository
    ) {}

    public function create(CreateHospitalDTO $dto) : int {
        $hospital = new Hospital (
            id      : null,
            nome    : $dto->nome,
            telefone: $dto->telefone,
            status  : StatusEnum::ATIVO->value
        );

        return $this->repository->create($hospital);
    }

    public function findById(int $id) : ?array {
        return $this->repository->findById($id);
    }

    public function findAll(?string $status = null) : array {
        $statusEnum = null;

        if ($status !== null) {
            $statusEnum = StatusEnum::tryFrom($status);

            if ($statusEnum === null)
                throw new InvalidArgumentException("Status Inválido. Use: ativo ou inativo!");
        }

        return $this->repository->findAll($statusEnum);
    }

    public function update(int $id, UpdateHospitalDTO $dto) : bool {
        $hospital = $this->repository->findById($id);

        if ($hospital === null)
            throw new InvalidArgumentException("Hospital não Encontrado!");

        if ($hospital['status'] === StatusEnum::INATIVO->value)
            throw new InvalidArgumentException("Hospital está Inativo!");

        $data = $dto->toArray();

        if ($data === [])
            return true;
        
        return $this->repository->update($id, $data);
    }

    public function delete(int $id) : bool {
        $hospital = $this->repository->findById($id);

        if ($hospital === null)
            throw new InvalidArgumentException("Hospital não Encontrado!");

        if ($hospital['status'] === StatusEnum::INATIVO->value)
            throw new InvalidArgumentException("Hospital já está Inativo!");

        return $this->repository->delete($id);
    }
}
<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Services;

use MaisLeiteBackend\Dtos\ColetasDomiciliares\CreateColetaDomiciliarDTO;
use MaisLeiteBackend\Dtos\ColetasDomiciliares\UpdateColetaDomiciliarDTO;
use MaisLeiteBackend\Enums\StatusColetaEnum;
use MaisLeiteBackend\Models\ColetaDomiciliar;
use MaisLeiteBackend\Repositories\ColetaDomiciliarRepository;
use InvalidArgumentException;

final class ColetaDomiciliarService
{
    public function __construct(
        private readonly ColetaDomiciliarRepository $repository
    ) {}

    public function create(CreateColetaDomiciliarDTO $dto): int
    {
        if (!$this->repository->doadoraExists($dto->doadoraId)) {
            throw new InvalidArgumentException("Doadora não encontrada ou inativa.");
        }

        if (!$this->repository->funcionarioExists($dto->funcionarioId)) {
            throw new InvalidArgumentException("Funcionário não encontrado ou inativo.");
        }

        $coleta = new ColetaDomiciliar(
            id: null,
            funcionarioId: $dto->funcionarioId,
            doadoraId: $dto->doadoraId,
            data: $dto->data,
            horaColeta: $dto->horaColeta,
            volumeDoado: $dto->volumeDoado,
            status: $dto->status
        );

        return $this->repository->create($coleta);
    }

    public function findById(int $id): ?array
    {
        return $this->repository->findById($id);
    }

    public function findAll(?string $status = null): array
    {
        $statusEnum = null;

        if ($status !== null) {
            $statusEnum = StatusColetaEnum::tryFrom($status);
            if ($statusEnum === null) {
                throw new InvalidArgumentException("Status inválido. Use: agendada, realizada ou cancelada.");
            }
        }

        return $this->repository->findAll($statusEnum);
    }

    public function update(int $id, UpdateColetaDomiciliarDTO $dto): bool
    {
        $coleta = $this->repository->findById($id);

        if ($coleta === null) {
            throw new InvalidArgumentException("Coleta não encontrada.");
        }

        $data = $dto->toArray();

        if ($dto->status === StatusColetaEnum::REALIZADA) {
            $horaColeta = $dto->horaColeta ?? $coleta['hora_coleta'];
            $volumeDoado = $dto->volumeDoado ?? $coleta['volume_doado'];

            if ($horaColeta === null) {
                throw new InvalidArgumentException("Horário é obrigatório para coleta realizada.");
            }
            if ($volumeDoado === null) {
                throw new InvalidArgumentException("Volume doado é obrigatório para coleta realizada.");
            }
        }

        return $this->repository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        $coleta = $this->repository->findById($id);

        if ($coleta === null) {
            throw new InvalidArgumentException("Coleta não encontrada.");
        }

        if ($coleta['status'] === StatusColetaEnum::CANCELADA->value) {
            throw new InvalidArgumentException("Coleta já está cancelada.");
        }

        if ($coleta['status'] === StatusColetaEnum::REALIZADA->value) {
            throw new InvalidArgumentException("Não é possível cancelar uma coleta já realizada.");
        }

        return $this->repository->delete($id);
    }
}

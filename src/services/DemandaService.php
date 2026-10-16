<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Services;

use InvalidArgumentException;
use MaisLeiteBackend\Dtos\Demandas\CreateDemandaDTO;
use MaisLeiteBackend\Dtos\Demandas\UpdateDemandaDTO;
use MaisLeiteBackend\Enums\StatusSolicitacaoEnum;
use MaisLeiteBackend\Models\Demanda;
use MaisLeiteBackend\Repositories\DemandaRepository;

final class DemandaService
{
    public function __construct(
        private readonly DemandaRepository $repository
    ) {}

    public function create(CreateDemandaDTO $dto) : int {
        if (!$this->repository->hospitalExists($dto->hospital_id))
            throw new InvalidArgumentException("Hospital não encontrado ou inativo!");

        $demanda = new Demanda(
            id                 : null,
            hospital_id        : $dto->hospital_id,
            volume_total       : $dto->volume_total,
            numero_de_bebes    : $dto->numero_de_bebes,
            data_demanda       : $dto->data_demanda,
            status_solicitacao : $dto->status_solicitacao
        );

        return $this->repository->create($demanda);
    }

    public function findById(int $id) : ?array {
        return $this->repository->findById($id);
    }

    public function findAll(?string $status = null) : array {
        $statusEnum = null;

        if ($status !== null) {
            $statusEnum = StatusSolicitacaoEnum::tryFrom($status);
            if ($statusEnum === null)
                throw new InvalidArgumentException("Status Inválido! Use: pendente, aprovada, atendida ou cancelada.");
        }

        return $this->repository->findAll($statusEnum);
    }

    public function update(int $id, UpdateDemandaDTO $dto) : bool {
        $demanda = $this->repository->findById($id);

        if ($demanda === null)
            throw new InvalidArgumentException("Demanda não encontrada!");

        $data = $dto->toArray();

        return $this->repository->update($id, $data);
    }

    public function delete(int $id) : bool {
        $demanda = $this->repository->findById($id);

        if ($demanda === null)
            throw new InvalidArgumentException("Demanda não encontrada!");

        if ($demanda['status_solicitacao'] === StatusSolicitacaoEnum::CANCELADA->value)
            throw new InvalidArgumentException("Demanda já está cancelada!");

        if ($demanda['status_solicitacao'] === StatusSolicitacaoEnum::ATENDIDA->value)
            throw new InvalidArgumentException("Não é possível cancelar uma demanda já atendida!");

        return $this->repository->delete($id);
    }
}
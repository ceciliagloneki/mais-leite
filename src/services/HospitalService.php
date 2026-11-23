<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Services;

use MaisLeiteBackend\Dtos\Hospitais\CreateDemandaDTO;
use MaisLeiteBackend\Dtos\Hospitais\CreateHospitalDTO;
use MaisLeiteBackend\Dtos\Hospitais\CreatePrescricaoDTO;
use MaisLeiteBackend\Models\Demanda;
use MaisLeiteBackend\Models\Hospital;
use MaisLeiteBackend\Models\Prescricao;
use MaisLeiteBackend\Repositories\DemandaRepository;
use MaisLeiteBackend\Repositories\HospitalRepository;
use MaisLeiteBackend\Repositories\PrescricaoRepository;
use InvalidArgumentException;

final class HospitalService
{
    public function __construct(
        private readonly HospitalRepository $repository,
        private readonly DemandaRepository $demandaRepository,
        private readonly PrescricaoRepository $prescricaoRepository
    ) {}

    public function create(CreateHospitalDTO $dto): int
    {
        return $this->repository->create(new Hospital(id: null, nome: $dto->nome, telefone: $dto->telefone));
    }

    public function update(int $id, CreateHospitalDTO $dto): bool
    {
        if ($this->repository->findById($id) === null) {
            throw new InvalidArgumentException("Hospital não encontrado.");
        }

        return $this->repository->update($id, new Hospital(id: $id, nome: $dto->nome, telefone: $dto->telefone));
    }

    public function findAll(): array
    {
        return $this->repository->findAll();
    }

    public function createDemanda(CreateDemandaDTO $dto): int
    {
        if ($this->repository->findById($dto->hospitalId) === null) {
            throw new InvalidArgumentException("Hospital não encontrado.");
        }

        return $this->demandaRepository->create(new Demanda(
            id: null,
            hospitalId: $dto->hospitalId,
            dataDemanda: $dto->dataDemanda,
            volumeTotal: $dto->volumeTotal,
            numeroDeBebes: $dto->numeroDeBebes
        ));
    }

    public function findDemandas(): array
    {
        return $this->demandaRepository->findAll();
    }

    public function createPrescricao(int $demandaId, CreatePrescricaoDTO $dto): int
    {
        $demanda = $this->demandaRepository->findById($demandaId);

        if ($demanda === null) {
            throw new InvalidArgumentException("Demanda não encontrada.");
        }
        if ($demanda['status'] !== 'pendente') {
            throw new InvalidArgumentException("Esta demanda já foi atendida.");
        }

        return $this->prescricaoRepository->create(new Prescricao(
            id: null,
            demandaId: $demandaId,
            nomeDoRn: $dto->nomeDoRn,
            volumePrescrito: $dto->volumePrescrito,
            tipoLeite: $dto->tipoLeite
        ));
    }

    public function findPrescricoes(): array
    {
        return $this->prescricaoRepository->findAll();
    }
}

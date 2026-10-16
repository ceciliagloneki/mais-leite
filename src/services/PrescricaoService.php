<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Services;

use InvalidArgumentException;
use MaisLeiteBackend\Dtos\Prescricoes\CreatePrescricaoDTO;
use MaisLeiteBackend\Dtos\Prescricoes\UpdatePrescricaoDTO;
use MaisLeiteBackend\Enums\TipoleiteEnum;
use MaisLeiteBackend\Models\Prescricao;
use MaisLeiteBackend\Repositories\PrescricaoRepository;

final class PrescricaoService
{
    public function __construct(
        private readonly PrescricaoRepository $repo
    ) {}

    public function create(CreatePrescricaoDTO $dto) : int {
        if (!$this->repo->demandaExists($dto->demanda_id))
            throw new InvalidArgumentException("Demanda não encontrada ou inativa!");

        $prescricao = new Prescricao(
            id               : null,
            demanda_id       : $dto->demanda_id,
            volume_prescrito : $dto->volume_prescrito,
            nome_do_rn       : $dto->nome_do_rn,
            tipo_leite       : $dto->tipo_leite
        );

        return $this->repo->create($prescricao);
    }

    public function findById(int $id) : ?array {
        return $this->repo->findById($id);
    }

    public function findAll(?int $demanda_id = null,  ?string $tipo_leite = null) : array {
        $tipoEnum = null;
        
        if ($demanda_id !== null) {
            if (!$this->repo->demandaExists($demanda_id)) 
                throw new InvalidArgumentException("Demanda não encontrada!");
        }

        if ($tipo_leite !== null) {
            $tipoEnum = TipoleiteEnum::tryFrom($tipo_leite);
            if ($tipoEnum === null)
                throw new InvalidArgumentException("Status Inválido! Use: pendente, aprovada, atendida ou cancelada.");
        }

        return $this->repo->findAll($demanda_id, $tipoEnum);
    }

    public function update(int $id, UpdatePrescricaoDTO $dto) : bool {
        $prescricao = $this->repo->findById($id);

        if ($prescricao === null)
            throw new InvalidArgumentException("Prescrição não encontrada!");

        $data = $dto->toArray();

        return $this->repo->update($id, $data);
    }

    public function delete(int $id) : bool {
        $prescricao = $this->repo->findById($id);

        if ($prescricao === null)
            throw new InvalidArgumentException("Prescrição não encontrada!");

        if ($prescricao['deleted_at'] !== null)
            throw new InvalidArgumentException("Precrição já está deletada!");

        return $this->repo->delete($id);
    }
}
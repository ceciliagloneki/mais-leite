<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Services;

use MaisLeiteBackend\Dtos\ControleFrascos\CreateControleFrascoDTO;
use MaisLeiteBackend\Dtos\ControleFrascos\UpdateControleFrascoDTO;
use MaisLeiteBackend\Enums\TipoFrascoEnum;
use MaisLeiteBackend\Models\ControleFrasco;
use MaisLeiteBackend\Repositories\ControleFrascoRepository;
use InvalidArgumentException;

final class ControleFrascoService
{
    public function __construct(
        private readonly ControleFrascoRepository $repository
    ) {}

    public function create(CreateControleFrascoDTO $dto): int
    {
        if (!$this->repository->visitaColetaExists($dto->visitaColetaId)) {
            throw new InvalidArgumentException("Coleta domiciliar não encontrada.");
        }

        if ($this->repository->existsByVisitaAndTipo($dto->visitaColetaId, $dto->tipoFrasco)) {
            throw new InvalidArgumentException(
                "Já existe um controle ativo deste tipo de frasco para esta coleta. Atualize o registro existente."
            );
        }

        $controle = new ControleFrasco(
            id: null,
            visitaColetaId: $dto->visitaColetaId,
            tipoFrasco: $dto->tipoFrasco,
            qtdEnviada: $dto->qtdEnviada,
            qtdRecebida: $dto->qtdRecebida
        );

        return $this->repository->create($controle);
    }

    public function findById(int $id): ?array
    {
        return $this->repository->findById($id);
    }

    public function findAll(?string $visitaColetaId = null): array
    {
        $visitaColetaIdInt = null;

        if ($visitaColetaId !== null) {
            if (!ctype_digit($visitaColetaId) || (int) $visitaColetaId <= 0) {
                throw new InvalidArgumentException("Filtro 'visita_coleta_id' deve ser um número inteiro positivo.");
            }
            $visitaColetaIdInt = (int) $visitaColetaId;
        }

        return $this->repository->findAll($visitaColetaIdInt);
    }

    public function update(int $id, UpdateControleFrascoDTO $dto): bool
    {
        $controle = $this->repository->findById($id);

        if ($controle === null) {
            throw new InvalidArgumentException("Controle de frascos não encontrado.");
        }

        // Compara com os valores salvos quando apenas uma das quantidades é enviada
        $qtdEnviada = $dto->qtdEnviada ?? (int) $controle['qtd_enviada'];
        $qtdRecebida = $dto->qtdRecebida ?? (int) $controle['qtd_recebida'];

        if ($qtdRecebida > $qtdEnviada) {
            throw new InvalidArgumentException("Quantidade recebida não pode ser maior que a quantidade enviada.");
        }

        $tipoFrasco = $dto->tipoFrasco ?? TipoFrascoEnum::from($controle['tipo_frasco']);
        if ($this->repository->existsByVisitaAndTipo((int) $controle['visita_coleta_id'], $tipoFrasco, $id)) {
            throw new InvalidArgumentException(
                "Já existe um controle ativo deste tipo de frasco para esta coleta. Atualize o registro existente."
            );
        }

        return $this->repository->update($id, $dto->toArray());
    }

    public function delete(int $id): bool
    {
        $controle = $this->repository->findById($id);

        if ($controle === null) {
            throw new InvalidArgumentException("Controle de frascos não encontrado.");
        }

        return $this->repository->delete($id);
    }
}

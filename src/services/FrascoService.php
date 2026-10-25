<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Services;

use MaisLeiteBackend\Dtos\Frascos\CreateFrascoDTO;
use MaisLeiteBackend\Dtos\Frascos\UpdateFrascoDTO;
use MaisLeiteBackend\Enums\EstadoFrascoEnum;
use MaisLeiteBackend\Enums\TipoFrascoEnum;
use MaisLeiteBackend\Models\Frasco;
use MaisLeiteBackend\Repositories\FrascoRepository;
use DomainException;
use InvalidArgumentException;

final class FrascoService
{
    public function __construct(
        private readonly FrascoRepository $repository
    ) {}

    public function create(CreateFrascoDTO $dto): int
    {
        // Todo frasco entra no processo pela coleta domiciliar
        if ($dto->estado !== null && $dto->estado !== EstadoFrascoEnum::COLETA_DOMICILIAR) {
            throw new DomainException("Todo frasco deve ser cadastrado no estado 'coleta_domiciliar'.");
        }

        $this->validateCapacidade($dto->tipoFrasco, $dto->volumeTotal);

        $frasco = new Frasco(
            id: null,
            tipoFrasco: $dto->tipoFrasco,
            volumeTotal: $dto->volumeTotal,
            estado: EstadoFrascoEnum::COLETA_DOMICILIAR
        );

        return $this->repository->create($frasco);
    }

    public function findById(int $id): ?array
    {
        return $this->repository->findById($id);
    }

    public function findAll(?string $tipoFrasco = null, ?string $estado = null): array
    {
        $tipoFrascoEnum = null;
        $estadoEnum = null;

        if ($tipoFrasco !== null) {
            $tipoFrascoEnum = TipoFrascoEnum::tryFrom($tipoFrasco);
            if ($tipoFrascoEnum === null) {
                throw new InvalidArgumentException("Filtro 'tipo_frasco' inválido. Use: tampa_plastica_500ml ou graduado_200ml.");
            }
        }

        if ($estado !== null) {
            $estadoEnum = EstadoFrascoEnum::tryFrom($estado);
            if ($estadoEnum === null) {
                $permitidos = implode(', ', array_column(EstadoFrascoEnum::cases(), 'value'));
                throw new InvalidArgumentException("Filtro 'estado' inválido. Use: {$permitidos}.");
            }
        }

        return $this->repository->findAll($tipoFrascoEnum, $estadoEnum);
    }

    public function update(int $id, UpdateFrascoDTO $dto): bool
    {
        $frasco = $this->repository->findById($id);

        if ($frasco === null) {
            throw new InvalidArgumentException("Frasco não encontrado.");
        }

        // Valida a capacidade com o valor salvo quando apenas tipo ou volume é enviado
        $tipoFrasco = $dto->tipoFrasco ?? TipoFrascoEnum::from($frasco['tipo_frasco']);
        $volumeTotal = $dto->volumeTotal ?? (float) $frasco['volume_total'];
        $this->validateCapacidade($tipoFrasco, $volumeTotal);

        if ($dto->estado !== null) {
            $estadoAtual = EstadoFrascoEnum::from($frasco['estado']);

            // Enviar o mesmo estado atual não é considerado uma mudança
            if ($dto->estado !== $estadoAtual && !$estadoAtual->podeTransicionarPara($dto->estado)) {
                throw new DomainException(
                    "Transição de estado inválida: '{$estadoAtual->value}' → '{$dto->estado->value}'."
                );
            }
        }

        return $this->repository->update($id, $dto->toArray());
    }

    public function delete(int $id): bool
    {
        $frasco = $this->repository->findById($id);

        if ($frasco === null) {
            throw new InvalidArgumentException("Frasco não encontrado.");
        }

        // Mantém a rastreabilidade doadora → frasco → RN
        if ($this->repository->isLinkedToActiveRawMilk($id)) {
            throw new DomainException("Frasco vinculado a um frasco de leite cru ativo não pode ser excluído.");
        }

        return $this->repository->delete($id);
    }

    private function validateCapacidade(TipoFrascoEnum $tipoFrasco, float $volumeTotal): void
    {
        if ($volumeTotal > $tipoFrasco->capacidade()) {
            throw new DomainException(
                "Volume total excede a capacidade do frasco '{$tipoFrasco->value}' ({$tipoFrasco->capacidade()} mL)."
            );
        }
    }
}

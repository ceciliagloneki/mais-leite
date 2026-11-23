<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Services;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Dtos\Recepcoes\CreateRecepcaoDTO;
use MaisLeiteBackend\Enums\StatusFrascoCruEnum;
use MaisLeiteBackend\Models\Recepcao;
use MaisLeiteBackend\Repositories\FrascoLeiteCruRepository;
use MaisLeiteBackend\Repositories\RecepcaoRepository;
use InvalidArgumentException;

final class RecepcaoService
{
    public function __construct(
        private readonly RecepcaoRepository $repository,
        private readonly FrascoLeiteCruRepository $frascoRepository
    ) {}

    public function create(CreateRecepcaoDTO $dto, int $funcionarioId): int
    {
        $frascos = $this->frascoRepository->findByIds($dto->frascosIds);

        if (count($frascos) !== count($dto->frascosIds)) {
            throw new InvalidArgumentException("Um ou mais frascos não foram encontrados.");
        }

        $volumeTotal = 0.0;
        foreach ($frascos as $frasco) {
            if ($frasco['status'] !== StatusFrascoCruEnum::COLETADO->value) {
                throw new InvalidArgumentException("O frasco nº {$frasco['id']} já passou pela recepção.");
            }
            if ((int) $frasco['zona_id'] !== $dto->zonaId) {
                throw new InvalidArgumentException("O frasco nº {$frasco['id']} é de outra zona: cada caixa térmica traz os frascos de uma zona só.");
            }
            $volumeTotal += (float) $frasco['volume_ml'];
        }

        $db = Database::getConnection();
        $db->beginTransaction();

        try {
            $id = $this->repository->create(new Recepcao(
                id: null,
                funcionarioId: $funcionarioId,
                zonaId: $dto->zonaId,
                data: $dto->data,
                municipios: $dto->municipios,
                horaSaida: $dto->horaSaida,
                horaChegada: $dto->horaChegada,
                temperaturaCaixa: $dto->temperaturaCaixa,
                quantFrascos: count($frascos),
                volumeTotal: $volumeTotal,
                conforme: $dto->conforme,
                motivoDescarte: $dto->conforme ? null : $dto->motivoDescarte
            ));

            $status = $dto->conforme ? StatusFrascoCruEnum::CONFORME : StatusFrascoCruEnum::DESCARTADO;
            $this->frascoRepository->registrarRecepcao($dto->frascosIds, $id, $status->value);

            $db->commit();

            return $id;
        } catch (\Throwable $e) {
            $db->rollBack();
            throw $e;
        }
    }

    public function findAll(): array
    {
        return $this->repository->findAll();
    }
}

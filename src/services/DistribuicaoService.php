<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Services;

use InvalidArgumentException;
use MaisLeiteBackend\Dtos\Distribuicoes\CreateDistribuicaoDTO;
use MaisLeiteBackend\Dtos\Distribuicoes\UpdateDistribuicaoDTO;
use MaisLeiteBackend\Models\Distribuicao;
use MaisLeiteBackend\Repositories\DistribuicaoRepository;

final class DistribuicaoService
{
    public function __construct (
        private readonly DistribuicaoRepository $repo
    ) {}

    public function create(CreateDistribuicaoDTO $dto) : int {
        if (!$this->repo->demandaExists($dto->demandaId))
            throw new InvalidArgumentException("Demanda não encontrada!");

        $this->validateNotFuture($dto->data, $dto->horario);

        $distribuicao = new Distribuicao(
            id : null,
            demandaId : $dto->demandaId,
            data: $dto->data,
            horario: $dto->horario,
            assinaturaEntrega: $dto->assinaturaEntrega,
            assinaturaRecebimento: $dto->assinaturaRecebimento
        );

        return $this->repo->create($distribuicao);
    }

    public function findById (int $id) : ?array {
        return $this->repo->findById($id);
    }

    public function findAll (?int $demandaId = null, ?string $data = null) {
        if ($demandaId !== null) {
            if (!$this->repo->demandaExists($demandaId))
                throw new InvalidArgumentException("Demanda não encontrada!");
        }

        if ($data !== null) {
            $d = \DateTime::createFromFormat('Y-m-d', $data);

            if (!$d || $d->format('Y-m-d') !== $data)
                throw new InvalidArgumentException("Data é Inválida! Use o formato `AAAA-mm-dd`!");
        }

        return $this->repo->findAll($demandaId, $data);
    }

    public function update(int $id, UpdateDistribuicaoDTO $dto) : bool {
        $distribuicao = $this->repo->findById($id);

        if ($distribuicao === null)
            throw new InvalidArgumentException("Distribuição não encontrada!");

        $data = $dto->toArray();

        if ($data === []) return true;

        if ($dto->data !== null || $dto->horario !== null) {
            $dataFinal = $dto->data ?? $distribuicao['data'];
            $horarioFinal = $dto->horario ?? substr($distribuicao['horario'], 0, 5);

            $this->validateNotFuture($dataFinal, $horarioFinal);
        }

        return $this->repo->update($id, $data);
    }

    public function delete (int $id) : bool {
        $distribuicao = $this->repo->findById($id);

        if ($distribuicao === null)
            throw new InvalidArgumentException("Distribuição não encontrada!");

        return $this->repo->delete($id);
    }

    private function validateNotFuture(string $data, string $horario): void {
        $tz = new \DateTimeZone('America/Sao_Paulo');
        $horario = substr($horario, 0, 5);

        $informada = \DateTimeImmutable::createFromFormat(
            '!Y-m-d H:i',
            "{$data} {$horario}",
            $tz
        );

        if ($informada === false || $informada->format('Y-m-d H:i') !== "{$data} {$horario}") 
            throw new InvalidArgumentException("Data e (ou) horário da distribuição são inválidos!");

        $agora = new \DateTimeImmutable('now', $tz);

        if ($informada > $agora)
            throw new InvalidArgumentException("Data e (ou) horário da distribuição não podem ser futuros!");
    }
}
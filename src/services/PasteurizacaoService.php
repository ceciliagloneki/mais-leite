<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Services;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Dtos\Pasteurizacoes\CreateAnaliseFisicoQuimicaDTO;
use MaisLeiteBackend\Dtos\Pasteurizacoes\CreateFrascoPasteurizadoDTO;
use MaisLeiteBackend\Dtos\Pasteurizacoes\CreatePasteurizacaoDTO;
use MaisLeiteBackend\Enums\StatusFrascoCruEnum;
use MaisLeiteBackend\Enums\StatusFrascoPasteurizadoEnum;
use MaisLeiteBackend\Models\AnaliseFisicoQuimica;
use MaisLeiteBackend\Models\FrascoPasteurizado;
use MaisLeiteBackend\Models\Pasteurizacao;
use MaisLeiteBackend\Repositories\AnaliseFisicoQuimicaRepository;
use MaisLeiteBackend\Repositories\FrascoLeiteCruRepository;
use MaisLeiteBackend\Repositories\FrascoPasteurizadoRepository;
use MaisLeiteBackend\Repositories\PasteurizacaoRepository;
use InvalidArgumentException;

final class PasteurizacaoService
{
    private const DORNIC_MAXIMO = 8;

    public function __construct(
        private readonly PasteurizacaoRepository $repository,
        private readonly FrascoLeiteCruRepository $frascoCruRepository,
        private readonly FrascoPasteurizadoRepository $frascoPasteurizadoRepository,
        private readonly AnaliseFisicoQuimicaRepository $analiseRepository
    ) {}

    public function create(CreatePasteurizacaoDTO $dto, int $funcionarioId): int
    {
        $frascos = $this->frascoCruRepository->findByIds($dto->frascosIds);

        if (count($frascos) !== count($dto->frascosIds)) {
            throw new InvalidArgumentException("Um ou mais frascos não foram encontrados.");
        }

        foreach ($frascos as $frasco) {
            if ($frasco['status'] !== StatusFrascoCruEnum::CONFORME->value) {
                throw new InvalidArgumentException("O frasco nº {$frasco['id']} não está conforme para pasteurização.");
            }
        }

        $db = Database::getConnection();
        $db->beginTransaction();

        try {
            $id = $this->repository->create(new Pasteurizacao(
                id: null,
                funcionarioId: $funcionarioId,
                dataPasteurizacao: $dto->dataPasteurizacao
            ));

            $this->frascoCruRepository->registrarPasteurizacao($dto->frascosIds, $id);

            $db->commit();

            return $id;
        } catch (\Throwable $e) {
            $db->rollBack();
            throw $e;
        }
    }

    public function reenvasar(int $pasteurizacaoId, CreateFrascoPasteurizadoDTO $dto): int
    {
        $pasteurizacao = $this->repository->findById($pasteurizacaoId);

        if ($pasteurizacao === null) {
            throw new InvalidArgumentException("Pasteurização não encontrada.");
        }

        $volumeCru = 0.0;
        $classificacoes = [];
        foreach ($this->frascoCruRepository->findByPasteurizacao($pasteurizacaoId) as $frasco) {
            if ((int) $frasco['doadora_id'] === $dto->doadoraId) {
                $volumeCru += (float) $frasco['volume_ml'];
                $classificacoes[] = $frasco['classificacao'];
            }
        }

        if ($volumeCru === 0.0) {
            throw new InvalidArgumentException("Esta doadora não tem leite cru nesta pasteurização.");
        }
        $tipos = array_values(array_unique($classificacoes));
        $classificacao = $dto->classificacao ?? (count($tipos) === 1 ? $tipos[0] : null);
        if ($classificacao === null) {
            throw new InvalidArgumentException("Esta doadora tem mais de um tipo de leite nesta pasteurização: escolha o tipo.");
        }
        if (!in_array($classificacao, $tipos, true)) {
            throw new InvalidArgumentException("A classificação do leite não corresponde aos frascos crus desta doadora.");
        }

        $volumeDisponivel = $volumeCru - $this->frascoPasteurizadoRepository->volumeReenvasado($pasteurizacaoId, $dto->doadoraId);
        if ($dto->volume > $volumeDisponivel) {
            throw new InvalidArgumentException("Volume maior que o leite cru restante desta doadora ({$volumeDisponivel} mL).");
        }

        return $this->frascoPasteurizadoRepository->create(new FrascoPasteurizado(
            id: null,
            pasteurizacaoId: $pasteurizacaoId,
            doadoraId: $dto->doadoraId,
            volume: $dto->volume,
            classificacao: $classificacao,
            dataPasteurizacao: $pasteurizacao['data_pasteurizacao']
        ));
    }

    public function analisar(int $frascoId, CreateAnaliseFisicoQuimicaDTO $dto): bool
    {
        $frasco = $this->frascoPasteurizadoRepository->findById($frascoId);

        if ($frasco === null) {
            throw new InvalidArgumentException("Frasco pasteurizado não encontrado.");
        }
        if ($frasco['status'] !== StatusFrascoPasteurizadoEnum::QUARENTENA->value) {
            throw new InvalidArgumentException("Só é possível analisar frascos em quarentena.");
        }

        $aprovado = $dto->bgbl === 'negativo' && $dto->dornic <= self::DORNIC_MAXIMO;

        $db = Database::getConnection();
        $db->beginTransaction();

        try {
            $this->analiseRepository->create(new AnaliseFisicoQuimica(
                id: null,
                frascoPasteurizadoId: $frascoId,
                crematocritoTc: $dto->crematocritoTc,
                crematocritoTg: $dto->crematocritoTg,
                crematocritoE: $dto->crematocritoE,
                dornic: $dto->dornic,
                bgbl: $dto->bgbl,
                temperatura: $dto->temperatura,
                dataAnalise: $dto->dataAnalise,
                aprovado: $aprovado
            ));

            $status = $aprovado ? StatusFrascoPasteurizadoEnum::DISPONIVEL : StatusFrascoPasteurizadoEnum::REPROVADO;
            $this->frascoPasteurizadoRepository->updateStatus($frascoId, $status->value);

            $db->commit();

            return $aprovado;
        } catch (\Throwable $e) {
            $db->rollBack();
            throw $e;
        }
    }

    public function findAll(): array
    {
        return $this->repository->findAll();
    }

    public function findFrascos(?string $status): array
    {
        return $this->frascoPasteurizadoRepository->findAll($status);
    }
}

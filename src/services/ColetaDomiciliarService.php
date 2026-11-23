<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Services;

use MaisLeiteBackend\Dtos\ColetasDomiciliares\AgendarVisitaDTO;
use MaisLeiteBackend\Dtos\ColetasDomiciliares\CreateColetaDomiciliarDTO;
use MaisLeiteBackend\Dtos\ColetasDomiciliares\CreateFrascoLeiteCruDTO;
use MaisLeiteBackend\Dtos\ColetasDomiciliares\RealizarVisitaDTO;
use MaisLeiteBackend\Enums\StatusDoadoraEnum;
use MaisLeiteBackend\Enums\StatusVisitaEnum;
use MaisLeiteBackend\Enums\TipoLeiteEnum;
use MaisLeiteBackend\Models\ColetaDomiciliar;
use MaisLeiteBackend\Models\FrascoLeiteCru;
use MaisLeiteBackend\Repositories\ColetaDomiciliarRepository;
use MaisLeiteBackend\Repositories\DoadoraRepository;
use MaisLeiteBackend\Repositories\FrascoLeiteCruRepository;
use InvalidArgumentException;

final class ColetaDomiciliarService
{
    public function __construct(
        private readonly ColetaDomiciliarRepository $repository,
        private readonly FrascoLeiteCruRepository $frascoRepository,
        private readonly DoadoraRepository $doadoraRepository
    ) {}

    public function create(CreateColetaDomiciliarDTO $dto, int $funcionarioId): int
    {
        $doadora = $this->validarDoadora($dto->doadoraId);
        $this->validarDiaDaZona($doadora, $dto->data);
        if ($dto->data > date('Y-m-d')) {
            throw new InvalidArgumentException("Não é possível registrar uma visita com data futura.");
        }

        return $this->repository->create(new ColetaDomiciliar(
            id: null,
            doadoraId: $dto->doadoraId,
            funcionarioId: $funcionarioId,
            data: $dto->data,
            dataColetaSangue: $dto->dataColetaSangue,
            frascosNovos: $dto->frascosNovos,
            frascosEsterilizados: $dto->frascosEsterilizados
        ));
    }

    public function agendar(AgendarVisitaDTO $dto, int $funcionarioId): int
    {
        $doadora = $this->validarDoadora($dto->doadoraId);
        $this->validarDiaDaZona($doadora, $dto->data);

        if ($dto->data < date('Y-m-d')) {
            throw new InvalidArgumentException("Não é possível agendar visita em data passada.");
        }
        if ($this->repository->agendadaExists($dto->doadoraId, $dto->data)) {
            throw new InvalidArgumentException("Esta doadora já tem visita agendada neste dia.");
        }

        return $this->repository->create(new ColetaDomiciliar(
            id: null,
            doadoraId: $dto->doadoraId,
            funcionarioId: $funcionarioId,
            data: $dto->data,
            dataColetaSangue: null,
            frascosNovos: 0,
            frascosEsterilizados: 0,
            status: StatusVisitaEnum::AGENDADA->value
        ));
    }

    public function realizar(int $visitaId, RealizarVisitaDTO $dto, int $funcionarioId): void
    {
        $visita = $this->getAgendada($visitaId);
        $doadora = $this->validarDoadora((int) $visita['doadora_id']);
        $this->validarDiaDaZona($doadora, $dto->data);
        if ($dto->data > date('Y-m-d')) {
            throw new InvalidArgumentException("A visita só pode ser registrada a partir do dia em que acontece.");
        }

        $this->repository->realizar(
            $visitaId,
            $funcionarioId,
            $dto->data,
            $dto->dataColetaSangue,
            $dto->frascosNovos,
            $dto->frascosEsterilizados,
            $dto->frascosRecebidos
        );
    }

    public function cancelar(int $visitaId): void
    {
        $this->getAgendada($visitaId);
        $this->repository->updateStatus($visitaId, StatusVisitaEnum::CANCELADA->value);
    }

    public function registrarFrasco(int $visitaId, CreateFrascoLeiteCruDTO $dto): int
    {
        $visita = $this->repository->findById($visitaId);

        if ($visita === null) {
            throw new InvalidArgumentException("Visita de coleta não encontrada.");
        }
        if ($visita['status'] !== StatusVisitaEnum::REALIZADA->value) {
            throw new InvalidArgumentException("Só é possível registrar frascos em visita realizada.");
        }
        if ($visita['doadora_status'] !== StatusDoadoraEnum::ATIVA->value) {
            throw new InvalidArgumentException("Só é possível registrar leite de doadora ativa (triagem conforme e sorologia normal).");
        }

        return $this->frascoRepository->create(new FrascoLeiteCru(
            id: null,
            visitaColetaId: $visitaId,
            dataHoraPrimeiraColeta: $dto->dataHoraPrimeiraColeta,
            volumeMl: $dto->volumeMl,
            formaExtracao: $dto->formaExtracao,
            condPrestocagem: $dto->condPrestocagem,
            estado: $dto->estado,
            classificacao: TipoLeiteEnum::porDataDoParto($visita['data_parto'], $dto->dataHoraPrimeiraColeta)->value,
            data: $dto->data,
            responsavel: $dto->responsavel
        ));
    }

    public function findAll(): array
    {
        return $this->repository->findAll();
    }

    public function findFrascos(?string $status): array
    {
        return $this->frascoRepository->findAll($status);
    }

    private const DIAS_DA_SEMANA = [1 => 'segunda', 2 => 'terca', 3 => 'quarta', 4 => 'quinta', 5 => 'sexta', 6 => 'sabado', 7 => 'domingo'];

    private function validarDiaDaZona(array $doadora, string $data): void
    {
        $dia = self::DIAS_DA_SEMANA[(int) (new \DateTimeImmutable($data))->format('N')];

        if ($dia !== $doadora['dia_da_semana']) {
            throw new InvalidArgumentException(
                "A {$doadora['zona_nome']} é visitada às {$doadora['dia_da_semana']}s-feiras: escolha uma data nesse dia da semana."
            );
        }
    }

    private function validarDoadora(int $doadoraId): array
    {
        $doadora = $this->doadoraRepository->findById($doadoraId);

        if ($doadora === null) {
            throw new InvalidArgumentException("Doadora não encontrada.");
        }
        if (in_array($doadora['status'], [StatusDoadoraEnum::REMOVIDA->value, StatusDoadoraEnum::INAPTA->value], true)) {
            throw new InvalidArgumentException("Doadora inapta ou removida não recebe visitas de coleta.");
        }

        return $doadora;
    }

    private function getAgendada(int $visitaId): array
    {
        $visita = $this->repository->findById($visitaId);

        if ($visita === null) {
            throw new InvalidArgumentException("Visita de coleta não encontrada.");
        }
        if ($visita['status'] !== StatusVisitaEnum::AGENDADA->value) {
            throw new InvalidArgumentException("Esta visita não está agendada (já foi realizada ou cancelada).");
        }

        return $visita;
    }
}

<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Services;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Dtos\Doadoras\CreateDoadoraDTO;
use MaisLeiteBackend\Dtos\Doadoras\CreateSorologiaDTO;
use MaisLeiteBackend\Dtos\Doadoras\CreateTriagemDTO;
use MaisLeiteBackend\Enums\StatusDoadoraEnum;
use MaisLeiteBackend\Models\Doadora;
use MaisLeiteBackend\Models\Sorologia;
use MaisLeiteBackend\Models\Triagem;
use MaisLeiteBackend\Repositories\DoadoraRepository;
use MaisLeiteBackend\Repositories\FrascoLeiteCruRepository;
use MaisLeiteBackend\Repositories\FrascoPasteurizadoRepository;
use MaisLeiteBackend\Repositories\SorologiaRepository;
use MaisLeiteBackend\Repositories\TriagemRepository;
use InvalidArgumentException;

final class DoadoraService
{
    public function __construct(
        private readonly DoadoraRepository $repository,
        private readonly TriagemRepository $triagemRepository,
        private readonly SorologiaRepository $sorologiaRepository,
        private readonly FrascoLeiteCruRepository $frascoCruRepository,
        private readonly FrascoPasteurizadoRepository $frascoPasteurizadoRepository
    ) {}

    public function create(CreateDoadoraDTO $dto): int
    {
        $this->validate($dto, null);

        return $this->repository->create($this->toModel($dto));
    }

    public function update(int $id, CreateDoadoraDTO $dto): bool
    {
        $this->getDoadora($id);
        $this->validate($dto, $id);

        return $this->repository->update($id, $this->toModel($dto));
    }

    public function findAll(): array
    {
        return $this->repository->findAll();
    }

    public function findZonas(): array
    {
        return $this->repository->findZonas();
    }

    public function findById(int $id): ?array
    {
        $doadora = $this->repository->findById($id);

        if ($doadora === null) {
            return null;
        }

        $doadora['triagem'] = $this->triagemRepository->findByDoadora($id);
        $doadora['sorologias'] = $this->sorologiaRepository->findByDoadora($id);

        return $doadora;
    }

    public function registrarTriagem(int $doadoraId, CreateTriagemDTO $dto, int $funcionarioId): int
    {
        $doadora = $this->getDoadora($doadoraId);

        if ($doadora['status'] === StatusDoadoraEnum::REMOVIDA->value) {
            throw new InvalidArgumentException("Doadora removida do programa: uma amostra de sorologia deu alterada.");
        }
        if ($this->triagemRepository->findByDoadora($doadoraId) !== null) {
            throw new InvalidArgumentException("A triagem desta doadora já foi registrada.");
        }

        $id = $this->triagemRepository->create(new Triagem(
            id: null,
            doadoraId: $doadoraId,
            funcionarioId: $funcionarioId,
            dataTriagem: $dto->dataTriagem,
            aguaPotavel: $dto->aguaPotavel,
            esgoto: $dto->esgoto,
            renda: $dto->renda,
            infeccaoUrinaria: $dto->infeccaoUrinaria,
            hipertensao: $dto->hipertensao,
            diabetes: $dto->diabetes,
            hepatite: $dto->hepatite,
            apgarBebe: $dto->apgarBebe,
            pesoBebe: $dto->pesoBebe,
            malformacaoBebe: $dto->malformacaoBebe,
            equipamentoEstocagem: $dto->equipamentoEstocagem,
            produtosJuntoLeite: $dto->produtosJuntoLeite,
            conforme: $dto->conforme
        ));

        $this->atualizarStatus($doadoraId);

        return $id;
    }

    public function registrarSorologia(int $doadoraId, CreateSorologiaDTO $dto): int
    {
        $doadora = $this->getDoadora($doadoraId);

        if ($doadora['status'] === StatusDoadoraEnum::REMOVIDA->value) {
            throw new InvalidArgumentException("Doadora removida do programa: uma amostra de sorologia deu alterada.");
        }
        if ($this->sorologiaRepository->amostraExists($doadoraId, $dto->numeroAmostra)) {
            throw new InvalidArgumentException("A {$dto->numeroAmostra}ª amostra já foi registrada.");
        }
        $anterior = $dto->numeroAmostra - 1;
        if ($anterior >= 1 && !$this->sorologiaRepository->amostraExists($doadoraId, $anterior)) {
            throw new InvalidArgumentException("Registre a {$anterior}ª amostra antes da {$dto->numeroAmostra}ª.");
        }

        $db = Database::getConnection();
        $db->beginTransaction();

        try {
            $id = $this->sorologiaRepository->create(new Sorologia(
                id: null,
                doadoraId: $doadoraId,
                numeroAmostra: $dto->numeroAmostra,
                dataColeta: $dto->dataColeta,
                resultado: $dto->resultado
            ));

            if ($dto->resultado === 'alterado') {
                $this->frascoCruRepository->descartarDaDoadora($doadoraId);
                $this->frascoPasteurizadoRepository->bloquearDaDoadora($doadoraId);
            }
            $this->atualizarStatus($doadoraId);

            $db->commit();

            return $id;
        } catch (\Throwable $e) {
            $db->rollBack();
            throw $e;
        }
    }

    private function atualizarStatus(int $doadoraId): void
    {
        $triagem = $this->triagemRepository->findByDoadora($doadoraId);
        $primeiraAmostraNormal = false;
        $alterada = false;

        foreach ($this->sorologiaRepository->findByDoadora($doadoraId) as $sorologia) {
            if ((int) $sorologia['numero_amostra'] === 1 && $sorologia['resultado'] === 'normal') {
                $primeiraAmostraNormal = true;
            }
            if ($sorologia['resultado'] === 'alterado') {
                $alterada = true;
            }
        }

        $status = match (true) {
            $alterada => StatusDoadoraEnum::REMOVIDA,
            $triagem !== null && !$triagem['conforme'] => StatusDoadoraEnum::INAPTA,
            $triagem !== null && $primeiraAmostraNormal => StatusDoadoraEnum::ATIVA,
            default => StatusDoadoraEnum::EM_TRIAGEM,
        };

        $this->repository->updateStatus($doadoraId, $status->value);
    }

    private function validate(CreateDoadoraDTO $dto, ?int $id): void
    {
        if (!$this->repository->zonaExists($dto->zonaId)) {
            throw new InvalidArgumentException("Zona não encontrada.");
        }

        $outra = $this->repository->findByCartaoSus($dto->cartaoSus);
        if ($outra !== null && (int) $outra['id'] !== $id) {
            throw new InvalidArgumentException("Cartão SUS já cadastrado.");
        }
    }

    private function getDoadora(int $id): array
    {
        $doadora = $this->repository->findById($id);

        if ($doadora === null) {
            throw new InvalidArgumentException("Doadora não encontrada.");
        }

        return $doadora;
    }

    private function toModel(CreateDoadoraDTO $dto): Doadora
    {
        return new Doadora(
            id: null,
            zonaId: $dto->zonaId,
            nome: $dto->nome,
            dataNasc: $dto->dataNasc,
            cartaoSus: $dto->cartaoSus,
            telefone: $dto->telefone,
            enderecoRua: $dto->enderecoRua,
            enderecoNumero: $dto->enderecoNumero,
            enderecoBairro: $dto->enderecoBairro,
            nomeBebe: $dto->nomeBebe,
            dataParto: $dto->dataParto,
            vacinaFebreAmarela: $dto->vacinaFebreAmarela,
            vacinaDtpa: $dto->vacinaDtpa,
            transfusaoSangue: $dto->transfusaoSangue,
            dataTransfusao: $dto->dataTransfusao,
            tatuagem: $dto->tatuagem,
            dataTatuagem: $dto->dataTatuagem,
            fumante: $dto->fumante,
            cigarrosDia: $dto->cigarrosDia,
            consomeAlcool: $dto->consomeAlcool,
            usoMedicacao: $dto->usoMedicacao
        );
    }
}

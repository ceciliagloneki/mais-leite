<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Services;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Dtos\Distribuicoes\CreateAdministracaoDTO;
use MaisLeiteBackend\Dtos\Distribuicoes\CreateAlocacaoDTO;
use MaisLeiteBackend\Dtos\Distribuicoes\CreateDevolucaoDTO;
use MaisLeiteBackend\Dtos\Distribuicoes\CreateDistribuicaoDTO;
use MaisLeiteBackend\Enums\StatusFrascoPasteurizadoEnum;
use MaisLeiteBackend\Enums\TipoLeiteEnum;
use MaisLeiteBackend\Models\DevolucaoFrascos;
use MaisLeiteBackend\Models\Distribuicao;
use MaisLeiteBackend\Models\FrascoDistribuicao;
use MaisLeiteBackend\Repositories\DemandaRepository;
use MaisLeiteBackend\Repositories\DevolucaoFrascosRepository;
use MaisLeiteBackend\Repositories\DistribuicaoRepository;
use MaisLeiteBackend\Repositories\FrascoDistribuicaoRepository;
use MaisLeiteBackend\Repositories\FrascoPasteurizadoRepository;
use MaisLeiteBackend\Repositories\HospitalRepository;
use MaisLeiteBackend\Repositories\PrescricaoRepository;
use InvalidArgumentException;

final class DistribuicaoService
{
    public function __construct(
        private readonly DistribuicaoRepository $repository,
        private readonly FrascoDistribuicaoRepository $alocacaoRepository,
        private readonly FrascoPasteurizadoRepository $frascoRepository,
        private readonly PrescricaoRepository $prescricaoRepository,
        private readonly DemandaRepository $demandaRepository,
        private readonly HospitalRepository $hospitalRepository,
        private readonly DevolucaoFrascosRepository $devolucaoRepository
    ) {}

    public function alocar(CreateAlocacaoDTO $dto): int
    {
        $prescricao = $this->prescricaoRepository->findById($dto->prescricaoId);
        $frasco = $this->frascoRepository->findById($dto->frascoPasteurizadoId);

        if ($prescricao === null) {
            throw new InvalidArgumentException("Prescrição não encontrada.");
        }
        if ($prescricao['demanda_status'] !== 'pendente') {
            throw new InvalidArgumentException("A demanda desta prescrição já foi atendida.");
        }
        if ($frasco === null) {
            throw new InvalidArgumentException("Frasco pasteurizado não encontrado.");
        }
        if ($frasco['status'] !== StatusFrascoPasteurizadoEnum::DISPONIVEL->value) {
            throw new InvalidArgumentException("O frasco nº {$frasco['id']} não está disponível (precisa estar analisado e aprovado).");
        }
        if ($frasco['classificacao'] !== $prescricao['tipo_leite']) {
            $precisa = TipoLeiteEnum::from($prescricao['tipo_leite'])->rotulo();
            $frascoTipo = TipoLeiteEnum::from($frasco['classificacao'])->rotulo();
            throw new InvalidArgumentException("Tipo de leite incompatível: o bebê precisa de leite {$precisa} e o frasco é de leite {$frascoTipo}.");
        }

        $db = Database::getConnection();
        $db->beginTransaction();

        try {
            $id = $this->alocacaoRepository->create(new FrascoDistribuicao(
                id: null,
                prescricaoId: $dto->prescricaoId,
                frascoPasteurizadoId: $dto->frascoPasteurizadoId
            ));
            $this->frascoRepository->updateStatus($dto->frascoPasteurizadoId, StatusFrascoPasteurizadoEnum::ALOCADO->value);

            $db->commit();

            return $id;
        } catch (\Throwable $e) {
            $db->rollBack();
            throw $e;
        }
    }

    public function create(CreateDistribuicaoDTO $dto, int $funcionarioId): int
    {
        $demanda = $this->demandaRepository->findById($dto->demandaId);

        if ($demanda === null) {
            throw new InvalidArgumentException("Demanda não encontrada.");
        }

        $alocacoes = $this->alocacaoRepository->findProntosParaDistribuir($dto->demandaId);
        if ($alocacoes === []) {
            throw new InvalidArgumentException("Nenhum frasco foi separado para as prescrições desta demanda.");
        }

        $db = Database::getConnection();
        $db->beginTransaction();

        try {
            $id = $this->repository->create(new Distribuicao(
                id: null,
                demandaId: $dto->demandaId,
                funcionarioId: $funcionarioId,
                data: $dto->data,
                horario: $dto->horario,
                setor: $dto->setor,
                volumeCaixa: $dto->volumeCaixa,
                temperatura: $dto->temperatura,
                assinaturaEntrega: $dto->assinaturaEntrega,
                assinaturaRecebimento: $dto->assinaturaRecebimento
            ));

            foreach ($alocacoes as $alocacao) {
                $this->alocacaoRepository->registrarDistribuicao((int) $alocacao['id'], $id);
                $this->frascoRepository->updateStatus(
                    (int) $alocacao['frasco_pasteurizado_id'],
                    StatusFrascoPasteurizadoEnum::DISTRIBUIDO->value
                );
            }
            $this->demandaRepository->marcarAtendida($dto->demandaId);

            $db->commit();

            return $id;
        } catch (\Throwable $e) {
            $db->rollBack();
            throw $e;
        }
    }

    public function registrarAdministracao(int $alocacaoId, CreateAdministracaoDTO $dto): bool
    {
        $alocacao = $this->alocacaoRepository->findById($alocacaoId);

        if ($alocacao === null) {
            throw new InvalidArgumentException("Registro do frasco não encontrado.");
        }
        if ($alocacao['distribuicao_id'] === null) {
            throw new InvalidArgumentException("O frasco ainda não foi entregue ao hospital.");
        }

        return $this->alocacaoRepository->registrarAdministracao($alocacaoId, $dto->dataAdministracao);
    }

    public function registrarDevolucao(CreateDevolucaoDTO $dto): int
    {
        if ($this->hospitalRepository->findById($dto->hospitalId) === null) {
            throw new InvalidArgumentException("Hospital não encontrado.");
        }

        return $this->devolucaoRepository->create(new DevolucaoFrascos(
            id: null,
            hospitalId: $dto->hospitalId,
            data: $dto->data,
            tipoFrasco: $dto->tipoFrasco,
            qtdEnviada: $dto->qtdEnviada,
            qtdRecebida: $dto->qtdRecebida
        ));
    }

    public function findAll(): array
    {
        return $this->repository->findAll();
    }

    public function findById(int $id): ?array
    {
        $ficha = $this->repository->findById($id);

        if ($ficha === null) {
            return null;
        }

        $ficha['frascos'] = $this->alocacaoRepository->findAll($id);

        return $ficha;
    }

    public function findAlocacoes(): array
    {
        return $this->alocacaoRepository->findAll();
    }

    public function findDevolucoes(): array
    {
        return $this->devolucaoRepository->findAll();
    }
}

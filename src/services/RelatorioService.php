<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Services;

use MaisLeiteBackend\Repositories\RelatorioRepository;

final class RelatorioService
{
    public function __construct(
        private readonly RelatorioRepository $repository
    ) {}

    public function dashboard(): array
    {
        return [
            'doadoras' => $this->repository->doadorasPorStatus(),
            'frascos_crus' => $this->repository->frascosCrusPorStatus(),
            'estoque' => $this->repository->estoquePasteurizado(),
            'devolucoes_pendentes' => $this->repository->devolucoesPendentes(),
        ];
    }

    public function rastreabilidade(int $frascoId): ?array
    {
        $frasco = $this->repository->frascoPasteurizado($frascoId);

        if ($frasco === null) {
            return null;
        }

        $doadoraId = (int) $frasco['doadora_id'];

        return [
            'frasco' => $frasco,
            'origem' => [
                'doadora' => $this->repository->doadora($doadoraId),
                'sorologias' => $this->repository->sorologias($doadoraId),
                'frascos_crus' => $this->repository->frascosCrus((int) $frasco['pasteurizacao_id'], $doadoraId),
            ],
            'qualidade' => $this->repository->analise($frascoId),
            'destino' => $this->repository->destino($frascoId),
        ];
    }
}

<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Models;

final class Distribuicao
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $demandaId,
        public readonly int $funcionarioId,
        public readonly string $data,
        public readonly string $horario,
        public readonly string $setor,
        public readonly int $volumeCaixa,
        public readonly float $temperatura,
        public readonly string $assinaturaEntrega,
        public readonly string $assinaturaRecebimento
    ) {}
}

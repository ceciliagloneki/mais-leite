<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Models;

final class FrascoPasteurizado
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $pasteurizacaoId,
        public readonly int $doadoraId,
        public readonly float $volume,
        public readonly string $classificacao,
        public readonly string $dataPasteurizacao
    ) {}
}

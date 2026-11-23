<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Models;

final class Triagem
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $doadoraId,
        public readonly int $funcionarioId,
        public readonly string $dataTriagem,
        public readonly bool $aguaPotavel,
        public readonly bool $esgoto,
        public readonly ?float $renda,
        public readonly bool $infeccaoUrinaria,
        public readonly bool $hipertensao,
        public readonly bool $diabetes,
        public readonly bool $hepatite,
        public readonly ?int $apgarBebe,
        public readonly ?float $pesoBebe,
        public readonly bool $malformacaoBebe,
        public readonly string $equipamentoEstocagem,
        public readonly ?string $produtosJuntoLeite,
        public readonly bool $conforme
    ) {}
}

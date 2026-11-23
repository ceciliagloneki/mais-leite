<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Models;

final class AnaliseFisicoQuimica
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $frascoPasteurizadoId,
        public readonly float $crematocritoTc,
        public readonly float $crematocritoTg,
        public readonly float $crematocritoE,
        public readonly float $dornic,
        public readonly string $bgbl,
        public readonly float $temperatura,
        public readonly string $dataAnalise,
        public readonly bool $aprovado
    ) {}
}

<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Models;

final class Prescricao
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $demandaId,
        public readonly string $nomeDoRn,
        public readonly float $volumePrescrito,
        public readonly string $tipoLeite
    ) {}
}

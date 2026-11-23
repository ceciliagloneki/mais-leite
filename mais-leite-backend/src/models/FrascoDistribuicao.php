<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Models;

final class FrascoDistribuicao
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $prescricaoId,
        public readonly int $frascoPasteurizadoId
    ) {}
}

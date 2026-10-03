<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Models;

use MaisLeiteBackend\Enums\StatusColetaEnum;

final class ColetaDomiciliar
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $funcionarioId,
        public readonly int $doadoraId,
        public readonly string $data,
        public readonly ?string $horaColeta,
        public readonly ?float $volumeDoado,
        public readonly StatusColetaEnum $status
    ) {}
}

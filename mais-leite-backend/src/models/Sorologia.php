<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Models;

final class Sorologia
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $doadoraId,
        public readonly int $numeroAmostra,
        public readonly string $dataColeta,
        public readonly string $resultado
    ) {}
}

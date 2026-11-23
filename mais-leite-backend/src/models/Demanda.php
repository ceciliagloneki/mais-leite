<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Models;

final class Demanda
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $hospitalId,
        public readonly string $dataDemanda,
        public readonly float $volumeTotal,
        public readonly int $numeroDeBebes
    ) {}
}

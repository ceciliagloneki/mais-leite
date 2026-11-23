<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Models;

final class Pasteurizacao
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $funcionarioId,
        public readonly string $dataPasteurizacao
    ) {}
}

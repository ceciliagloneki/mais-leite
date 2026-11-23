<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Models;

final class Hospital
{
    public function __construct(
        public readonly ?int $id,
        public readonly string $nome,
        public readonly ?string $telefone
    ) {}
}

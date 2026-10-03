<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Models;

class Funcionario
{
    public function __construct(
        public readonly ?int $id,
        public readonly string $nome,
        public readonly string $cargo,
        public readonly string $email,
        public readonly string $senha,
        public readonly string $status
    ) {}
}
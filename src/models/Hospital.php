<?php

declare(strict_types=1);
namespace MaisLeiteBackend\Models;

class Hospital
{
    public function __construct(
        public readonly ?int    $id,
        public readonly string  $nome,
        public readonly ?string $telefone,
        public readonly string  $status
    ) {}
}
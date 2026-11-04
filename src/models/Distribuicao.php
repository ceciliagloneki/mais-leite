<?php

declare(strict_types=1);
namespace MaisLeiteBackend\Models;

class Distribuicao
{
    public function __construct (
        public readonly ?int $id,
        public readonly int $demandaId,
        public readonly string $data,
        public readonly string $horario,
        public readonly string $assinaturaEntrega,
        public readonly string $assinaturaRecebimento,
        public readonly ?string $deletedAt = null
    ) {}
}
<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Models;

final class DevolucaoFrascos
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $hospitalId,
        public readonly string $data,
        public readonly string $tipoFrasco,
        public readonly int $qtdEnviada,
        public readonly int $qtdRecebida
    ) {}
}

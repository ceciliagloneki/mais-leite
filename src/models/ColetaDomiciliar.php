<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Models;

final class ColetaDomiciliar
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $doadoraId,
        public readonly int $funcionarioId,
        public readonly string $data,
        public readonly ?string $dataColetaSangue,
        public readonly int $frascosNovos,
        public readonly int $frascosEsterilizados,
        public readonly string $status = 'realizada'
    ) {}
}

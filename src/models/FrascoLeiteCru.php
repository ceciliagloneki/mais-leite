<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Models;

final class FrascoLeiteCru
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $visitaColetaId,
        public readonly string $dataHoraPrimeiraColeta,
        public readonly float $volumeMl,
        public readonly string $formaExtracao,
        public readonly string $condPrestocagem,
        public readonly string $estado,
        public readonly string $classificacao,
        public readonly string $data,
        public readonly string $responsavel
    ) {}
}

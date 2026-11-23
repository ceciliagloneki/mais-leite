<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Models;

final class Recepcao
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $funcionarioId,
        public readonly int $zonaId,
        public readonly string $data,
        public readonly string $municipios,
        public readonly string $horaSaida,
        public readonly string $horaChegada,
        public readonly float $temperaturaCaixa,
        public readonly int $quantFrascos,
        public readonly float $volumeTotal,
        public readonly bool $conforme,
        public readonly ?string $motivoDescarte
    ) {}
}

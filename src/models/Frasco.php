<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Models;

use MaisLeiteBackend\Enums\EstadoFrascoEnum;
use MaisLeiteBackend\Enums\TipoFrascoEnum;

final class Frasco
{
    public function __construct(
        public readonly ?int $id,
        public readonly TipoFrascoEnum $tipoFrasco,
        public readonly float $volumeTotal,
        public readonly EstadoFrascoEnum $estado = EstadoFrascoEnum::COLETA_DOMICILIAR,
        public readonly ?string $deletedAt = null
    ) {}
}

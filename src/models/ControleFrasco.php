<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Models;

use MaisLeiteBackend\Enums\TipoFrascoEnum;

final class ControleFrasco
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $visitaColetaId,
        public readonly TipoFrascoEnum $tipoFrasco,
        public readonly int $qtdEnviada,
        public readonly int $qtdRecebida,
        public readonly ?string $deletedAt = null
    ) {}
}

<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Models;
use MaisLeiteBackend\Enums\TipoLeiteEnum;

class Prescricao
{
    public function __construct(
        public readonly ?int    $id,
        public readonly int    $demanda_id,
        public readonly float  $volume_prescrito,
        public readonly string $nome_do_rn,
        public readonly TipoLeiteEnum $tipo_leite,
        public readonly ?string $deleted_at = null
    ) {}
}
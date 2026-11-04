<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Enums;

enum TipoFrascoEnum: string
{
    case TAMPA_PLASTICA_500ML = 'tampa_plastica_500ml';
    case GRADUADO_200ML = 'graduado_200ml';

    // Capacidade máxima do frasco em mL
    public function capacidade(): int
    {
        return match ($this) {
            self::TAMPA_PLASTICA_500ML => 500,
            self::GRADUADO_200ML => 200,
        };
    }
}

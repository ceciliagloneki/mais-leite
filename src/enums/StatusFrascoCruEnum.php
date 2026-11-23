<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Enums;

enum StatusFrascoCruEnum: string
{
    case COLETADO = 'coletado';
    case CONFORME = 'conforme';
    case DESCARTADO = 'descartado';
    case PASTEURIZADO = 'pasteurizado';
}

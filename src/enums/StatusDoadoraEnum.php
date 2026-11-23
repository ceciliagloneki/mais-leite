<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Enums;

enum StatusDoadoraEnum: string
{
    case EM_TRIAGEM = 'em_triagem';
    case ATIVA = 'ativa';
    case INAPTA = 'inapta';
    case REMOVIDA = 'removida';
}

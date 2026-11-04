<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Enums;

enum StatusSolicitacaoEnum: string
{
    case PENDENTE  = 'pendente';
    case APROVADA  = 'aprovada';
    case ATENDIDA  = 'atendida';
    case CANCELADA = 'cancelada';
}
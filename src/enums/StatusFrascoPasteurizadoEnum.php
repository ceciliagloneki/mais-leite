<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Enums;

enum StatusFrascoPasteurizadoEnum: string
{
    case QUARENTENA = 'quarentena';
    case DISPONIVEL = 'disponivel';
    case REPROVADO = 'reprovado';
    case ALOCADO = 'alocado';
    case DISTRIBUIDO = 'distribuido';
    case BLOQUEADO = 'bloqueado';
}

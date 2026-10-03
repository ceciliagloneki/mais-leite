<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Enums;

enum StatusColetaEnum: string
{
    case AGENDADA = 'agendada';
    case REALIZADA = 'realizada';
    case CANCELADA = 'cancelada';
}

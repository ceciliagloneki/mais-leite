<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Enums;

enum TipoLeiteEnum : string
{
    case COLOSTRO  = 'colostro';
    case TRANSICAO = 'transicao';
    case MADURO    = 'maduro';
}
<?php

declare(strict_types=1);
namespace MaisLeiteBackend\Models;

use MaisLeiteBackend\Enums\StatusSolicitacaoEnum;

class Demanda
{
    public function __construct(
        public readonly ?int   $id,
        public readonly ?int   $hospital_id,
        public readonly float  $volume_total,
        public readonly int    $numero_de_bebes,
        public readonly string $data_demanda,
        public readonly StatusSolicitacaoEnum $status_solicitacao
    ) {}
}
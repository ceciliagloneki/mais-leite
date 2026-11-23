<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\ColetasDomiciliares;

use MaisLeiteBackend\Utils\Validation;

final class AgendarVisitaDTO
{
    public readonly int $doadoraId;
    public readonly string $data;

    public function __construct(array $data)
    {
        $this->doadoraId = Validation::int($data, 'doadora_id');
        $this->data = Validation::date($data, 'data');
    }
}

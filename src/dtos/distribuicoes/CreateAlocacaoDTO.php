<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Distribuicoes;

use MaisLeiteBackend\Utils\Validation;

final class CreateAlocacaoDTO
{
    public readonly int $prescricaoId;
    public readonly int $frascoPasteurizadoId;

    public function __construct(array $data)
    {
        $this->prescricaoId = Validation::int($data, 'prescricao_id');
        $this->frascoPasteurizadoId = Validation::int($data, 'frasco_pasteurizado_id');
    }
}

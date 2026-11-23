<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Pasteurizacoes;

use MaisLeiteBackend\Utils\Validation;

final class CreatePasteurizacaoDTO
{
    public readonly string $dataPasteurizacao;
    public readonly array $frascosIds;

    public function __construct(array $data)
    {
        $this->dataPasteurizacao = Validation::date($data, 'data_pasteurizacao');
        $this->frascosIds = Validation::ids($data, 'frascos_ids');
    }
}

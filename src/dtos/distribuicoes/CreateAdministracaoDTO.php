<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Distribuicoes;

use MaisLeiteBackend\Utils\Validation;

final class CreateAdministracaoDTO
{
    public readonly string $dataAdministracao;

    public function __construct(array $data)
    {
        $this->dataAdministracao = Validation::date($data, 'data_administracao');
    }
}

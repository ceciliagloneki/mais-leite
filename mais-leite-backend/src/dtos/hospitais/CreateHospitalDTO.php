<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Hospitais;

use MaisLeiteBackend\Utils\Validation;

final class CreateHospitalDTO
{
    public readonly string $nome;
    public readonly ?string $telefone;

    public function __construct(array $data)
    {
        $this->nome = Validation::text($data, 'nome');
        $this->telefone = Validation::text($data, 'telefone', false);
    }
}

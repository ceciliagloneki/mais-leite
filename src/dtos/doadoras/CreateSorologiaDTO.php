<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Doadoras;

use MaisLeiteBackend\Utils\Validation;

final class CreateSorologiaDTO
{
    public readonly int $numeroAmostra;
    public readonly string $dataColeta;
    public readonly string $resultado;

    public function __construct(array $data)
    {
        $this->numeroAmostra = (int) Validation::option($data, 'numero_amostra', ['1', '2', '3']);
        $this->dataColeta = Validation::date($data, 'data_coleta');
        $this->resultado = Validation::option($data, 'resultado', ['normal', 'alterado']);
    }
}

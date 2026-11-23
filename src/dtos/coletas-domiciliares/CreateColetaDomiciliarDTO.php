<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\ColetasDomiciliares;

use MaisLeiteBackend\Utils\Validation;

final class CreateColetaDomiciliarDTO
{
    public readonly int $doadoraId;
    public readonly string $data;
    public readonly ?string $dataColetaSangue;
    public readonly int $frascosNovos;
    public readonly int $frascosEsterilizados;

    public function __construct(array $data)
    {
        $this->doadoraId = Validation::int($data, 'doadora_id');
        $this->data = Validation::date($data, 'data');
        $this->dataColetaSangue = Validation::date($data, 'data_coleta_sangue', false);
        $this->frascosNovos = Validation::int($data, 'frascos_novos', false) ?? 0;
        $this->frascosEsterilizados = Validation::int($data, 'frascos_esterilizados', false) ?? 0;
    }
}

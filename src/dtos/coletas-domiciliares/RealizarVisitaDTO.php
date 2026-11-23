<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\ColetasDomiciliares;

use MaisLeiteBackend\Utils\Validation;

final class RealizarVisitaDTO
{
    public readonly string $data;
    public readonly ?string $dataColetaSangue;
    public readonly int $frascosNovos;
    public readonly int $frascosEsterilizados;
    public readonly int $frascosRecebidos;

    public function __construct(array $data)
    {
        $this->data = Validation::date($data, 'data');
        $this->dataColetaSangue = Validation::date($data, 'data_coleta_sangue', false);
        $this->frascosNovos = Validation::int($data, 'frascos_novos', false) ?? 0;
        $this->frascosEsterilizados = Validation::int($data, 'frascos_esterilizados', false) ?? 0;
        $this->frascosRecebidos = Validation::int($data, 'frascos_recebidos', false) ?? 0;
    }
}

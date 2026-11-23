<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Pasteurizacoes;

use MaisLeiteBackend\Utils\Validation;

final class CreateAnaliseFisicoQuimicaDTO
{
    public readonly float $crematocritoTc;
    public readonly float $crematocritoTg;
    public readonly float $crematocritoE;
    public readonly float $dornic;
    public readonly string $bgbl;
    public readonly float $temperatura;
    public readonly string $dataAnalise;

    public function __construct(array $data)
    {
        $this->crematocritoTc = Validation::number($data, 'crematocrito_tc');
        $this->crematocritoTg = Validation::number($data, 'crematocrito_tg');
        $this->crematocritoE = Validation::number($data, 'crematocrito_e');
        $this->dornic = Validation::number($data, 'dornic');
        $this->bgbl = Validation::option($data, 'bgbl', ['negativo', 'positivo']);
        $this->temperatura = Validation::number($data, 'temperatura');
        $this->dataAnalise = Validation::date($data, 'data_analise');
    }
}

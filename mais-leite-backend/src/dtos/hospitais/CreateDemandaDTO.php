<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Hospitais;

use MaisLeiteBackend\Utils\Validation;
use InvalidArgumentException;

final class CreateDemandaDTO
{
    public readonly int $hospitalId;
    public readonly string $dataDemanda;
    public readonly float $volumeTotal;
    public readonly int $numeroDeBebes;

    public function __construct(array $data)
    {
        $this->hospitalId = Validation::int($data, 'hospital_id');
        $this->dataDemanda = Validation::date($data, 'data_demanda');
        $this->volumeTotal = Validation::number($data, 'volume_total');
        $this->numeroDeBebes = Validation::int($data, 'numero_de_bebes');

        if ($this->volumeTotal <= 0 || $this->numeroDeBebes < 1) {
            throw new InvalidArgumentException("Informe o volume total e o número de bebês.");
        }
    }
}

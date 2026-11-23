<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Recepcoes;

use MaisLeiteBackend\Utils\Validation;

final class CreateRecepcaoDTO
{
    public readonly int $zonaId;
    public readonly string $data;
    public readonly string $municipios;
    public readonly string $horaSaida;
    public readonly string $horaChegada;
    public readonly float $temperaturaCaixa;
    public readonly bool $conforme;
    public readonly ?string $motivoDescarte;
    public readonly array $frascosIds;

    public function __construct(array $data)
    {
        $this->zonaId = Validation::int($data, 'zona_id');
        $this->data = Validation::date($data, 'data');
        $this->municipios = Validation::text($data, 'municipios');
        $this->horaSaida = Validation::time($data, 'hora_saida');
        $this->horaChegada = Validation::time($data, 'hora_chegada');
        $this->temperaturaCaixa = Validation::number($data, 'temperatura_caixa');
        $this->conforme = Validation::bool($data, 'conforme');
        $this->motivoDescarte = Validation::text($data, 'motivo_descarte', !$this->conforme);
        $this->frascosIds = Validation::ids($data, 'frascos_ids');
    }
}

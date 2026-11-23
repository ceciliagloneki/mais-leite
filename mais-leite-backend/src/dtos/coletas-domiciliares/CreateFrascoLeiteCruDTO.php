<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\ColetasDomiciliares;

use MaisLeiteBackend\Enums\TipoLeiteEnum;
use MaisLeiteBackend\Utils\Validation;
use InvalidArgumentException;

final class CreateFrascoLeiteCruDTO
{
    public readonly string $dataHoraPrimeiraColeta;
    public readonly float $volumeMl;
    public readonly string $formaExtracao;
    public readonly string $condPrestocagem;
    public readonly string $estado;
    public readonly ?string $classificacao;
    public readonly string $data;
    public readonly string $responsavel;

    public function __construct(array $data)
    {
        $this->dataHoraPrimeiraColeta = Validation::dateTime($data, 'data_hora_primeira_coleta');
        $this->volumeMl = Validation::number($data, 'volume_ml');
        $this->formaExtracao = Validation::option($data, 'forma_extracao', ['manual', 'mecanica_manual', 'mecanica_eletrica']);
        $this->condPrestocagem = Validation::option($data, 'cond_prestocagem', ['congelador', 'freezer']);
        $this->estado = Validation::option($data, 'estado', ['refrigerado', 'congelado', 'misto']);
        $this->classificacao = Validation::option($data, 'classificacao', TipoLeiteEnum::values(), false);
        $this->data = Validation::date($data, 'data');
        $this->responsavel = Validation::text($data, 'responsavel');

        if ($this->volumeMl <= 0) {
            throw new InvalidArgumentException("O volume do frasco deve ser maior que zero.");
        }
    }
}

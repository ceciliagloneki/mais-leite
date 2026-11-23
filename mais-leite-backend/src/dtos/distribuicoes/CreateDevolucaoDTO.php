<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Distribuicoes;

use MaisLeiteBackend\Utils\Validation;
use InvalidArgumentException;

final class CreateDevolucaoDTO
{
    public readonly int $hospitalId;
    public readonly string $data;
    public readonly string $tipoFrasco;
    public readonly int $qtdEnviada;
    public readonly int $qtdRecebida;

    public function __construct(array $data)
    {
        $this->hospitalId = Validation::int($data, 'hospital_id');
        $this->data = Validation::date($data, 'data');
        $this->tipoFrasco = Validation::option($data, 'tipo_frasco', ['tampa_plastica_500ml', 'graduado_200ml']);
        $this->qtdEnviada = Validation::int($data, 'qtd_enviada');
        $this->qtdRecebida = Validation::int($data, 'qtd_recebida');

        if ($this->qtdRecebida > $this->qtdEnviada) {
            throw new InvalidArgumentException("A quantidade recebida não pode ser maior que a enviada.");
        }
    }
}

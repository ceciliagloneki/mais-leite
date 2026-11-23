<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Distribuicoes;

use MaisLeiteBackend\Utils\Validation;

final class CreateDistribuicaoDTO
{
    public readonly int $demandaId;
    public readonly string $data;
    public readonly string $horario;
    public readonly string $setor;
    public readonly int $volumeCaixa;
    public readonly float $temperatura;
    public readonly string $assinaturaEntrega;
    public readonly string $assinaturaRecebimento;

    public function __construct(array $data)
    {
        $this->demandaId = Validation::int($data, 'demanda_id');
        $this->data = Validation::date($data, 'data');
        $this->horario = Validation::time($data, 'horario');
        $this->setor = Validation::text($data, 'setor');
        $this->volumeCaixa = (int) Validation::option($data, 'volume_caixa', ['200', '250', '300', '350']);
        $this->temperatura = Validation::number($data, 'temperatura');
        $this->assinaturaEntrega = Validation::text($data, 'assinatura_entrega');
        $this->assinaturaRecebimento = Validation::text($data, 'assinatura_recebimento');
    }
}

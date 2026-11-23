<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Doadoras;

use MaisLeiteBackend\Utils\Validation;
use InvalidArgumentException;

final class CreateTriagemDTO
{
    public readonly string $dataTriagem;
    public readonly bool $aguaPotavel;
    public readonly bool $esgoto;
    public readonly ?float $renda;
    public readonly bool $infeccaoUrinaria;
    public readonly bool $hipertensao;
    public readonly bool $diabetes;
    public readonly bool $hepatite;
    public readonly ?int $apgarBebe;
    public readonly ?float $pesoBebe;
    public readonly bool $malformacaoBebe;
    public readonly string $equipamentoEstocagem;
    public readonly ?string $produtosJuntoLeite;
    public readonly bool $conforme;

    public function __construct(array $data)
    {
        $this->dataTriagem = Validation::date($data, 'data_triagem');
        $this->aguaPotavel = Validation::bool($data, 'agua_potavel');
        $this->esgoto = Validation::bool($data, 'esgoto');
        $this->renda = Validation::number($data, 'renda', false);
        $this->infeccaoUrinaria = Validation::bool($data, 'infeccao_urinaria');
        $this->hipertensao = Validation::bool($data, 'hipertensao');
        $this->diabetes = Validation::bool($data, 'diabetes');
        $this->hepatite = Validation::bool($data, 'hepatite');
        $this->apgarBebe = Validation::int($data, 'apgar_bebe', false);
        $this->pesoBebe = Validation::number($data, 'peso_bebe', false);
        $this->malformacaoBebe = Validation::bool($data, 'malformacao_bebe');
        $this->equipamentoEstocagem = Validation::option($data, 'equipamento_estocagem', ['freezer', 'refrigerador', 'duplex']);
        $this->produtosJuntoLeite = Validation::text($data, 'produtos_junto_leite', false);
        $this->conforme = Validation::bool($data, 'conforme');

        if ($this->apgarBebe !== null && $this->apgarBebe > 10) {
            throw new InvalidArgumentException("O Apgar deve estar entre 0 e 10.");
        }
    }
}

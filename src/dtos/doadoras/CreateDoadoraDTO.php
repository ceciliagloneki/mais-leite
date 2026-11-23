<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Doadoras;

use MaisLeiteBackend\Utils\Validation;
use InvalidArgumentException;

final class CreateDoadoraDTO
{
    public readonly int $zonaId;
    public readonly string $nome;
    public readonly string $dataNasc;
    public readonly string $cartaoSus;
    public readonly ?string $telefone;
    public readonly ?string $enderecoRua;
    public readonly ?string $enderecoNumero;
    public readonly ?string $enderecoBairro;
    public readonly ?string $nomeBebe;
    public readonly string $dataParto;
    public readonly bool $vacinaFebreAmarela;
    public readonly bool $vacinaDtpa;
    public readonly bool $transfusaoSangue;
    public readonly ?string $dataTransfusao;
    public readonly bool $tatuagem;
    public readonly ?string $dataTatuagem;
    public readonly bool $fumante;
    public readonly ?int $cigarrosDia;
    public readonly bool $consomeAlcool;
    public readonly ?string $usoMedicacao;

    public function __construct(array $data)
    {
        $this->zonaId = Validation::int($data, 'zona_id');
        $this->nome = Validation::text($data, 'nome');
        $this->dataNasc = Validation::date($data, 'data_nasc');
        $this->cartaoSus = $this->validateCartaoSus(Validation::text($data, 'cartao_sus'));
        $this->telefone = Validation::text($data, 'telefone', false);
        $this->enderecoRua = Validation::text($data, 'endereco_rua', false);
        $this->enderecoNumero = Validation::text($data, 'endereco_numero', false);
        $this->enderecoBairro = Validation::text($data, 'endereco_bairro', false);
        $this->nomeBebe = Validation::text($data, 'nome_bebe', false);
        $this->dataParto = Validation::date($data, 'data_parto');
        $this->vacinaFebreAmarela = Validation::bool($data, 'vacina_febre_amarela');
        $this->vacinaDtpa = Validation::bool($data, 'vacina_dtpa');
        $this->transfusaoSangue = Validation::bool($data, 'transfusao_sangue');
        $this->dataTransfusao = Validation::month($data, 'data_transfusao', $this->transfusaoSangue);
        $this->tatuagem = Validation::bool($data, 'tatuagem');
        $this->dataTatuagem = Validation::month($data, 'data_tatuagem', $this->tatuagem);
        $this->fumante = Validation::bool($data, 'fumante');
        $this->cigarrosDia = Validation::int($data, 'cigarros_dia', $this->fumante);
        $this->consomeAlcool = Validation::bool($data, 'consome_alcool');
        $this->usoMedicacao = Validation::text($data, 'uso_medicacao', false);

        if ($this->dataNasc > date('Y-m-d') || $this->dataParto > date('Y-m-d')) {
            throw new InvalidArgumentException("As datas de nascimento e do parto não podem estar no futuro.");
        }
    }

    private function validateCartaoSus(string $cartaoSus): string
    {
        $numeros = preg_replace('/\D/', '', $cartaoSus);

        if (strlen($numeros) !== 15) {
            throw new InvalidArgumentException("O Cartão SUS deve ter 15 dígitos.");
        }

        return $numeros;
    }
}

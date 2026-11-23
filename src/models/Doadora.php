<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Models;

final class Doadora
{
    public function __construct(
        public readonly ?int $id,
        public readonly int $zonaId,
        public readonly string $nome,
        public readonly string $dataNasc,
        public readonly string $cartaoSus,
        public readonly ?string $telefone,
        public readonly ?string $enderecoRua,
        public readonly ?string $enderecoNumero,
        public readonly ?string $enderecoBairro,
        public readonly ?string $nomeBebe,
        public readonly string $dataParto,
        public readonly bool $vacinaFebreAmarela,
        public readonly bool $vacinaDtpa,
        public readonly bool $transfusaoSangue,
        public readonly ?string $dataTransfusao,
        public readonly bool $tatuagem,
        public readonly ?string $dataTatuagem,
        public readonly bool $fumante,
        public readonly ?int $cigarrosDia,
        public readonly bool $consomeAlcool,
        public readonly ?string $usoMedicacao
    ) {}
}

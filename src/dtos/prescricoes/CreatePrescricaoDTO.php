<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Prescricoes;
use MaisLeiteBackend\Enums\TipoleiteEnum;
use InvalidArgumentException;

final class CreatePrescricaoDTO
{
    public readonly int    $demanda_id;
    public readonly float  $volume_prescrito;
    public readonly string $nome_do_rn;
    public readonly TipoleiteEnum $tipo_leite;

    public function __construct(array $data)
    {
        $this->validateRequired($data);
    }

    public function validateRequired(array $data) : void {}
    private function validateVolumePrescrito(float $volume_prescrito) : float {}
    private function validateNomeDoRn(string $nome_do_rn) : string {}
    private function validateTipoLeite(string $tipo) : TipoleiteEnum {}
}
<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Frascos;

use MaisLeiteBackend\Enums\EstadoFrascoEnum;
use MaisLeiteBackend\Enums\TipoFrascoEnum;
use InvalidArgumentException;

final class CreateFrascoDTO
{
    public readonly TipoFrascoEnum $tipoFrasco;
    public readonly float $volumeTotal;
    public readonly ?EstadoFrascoEnum $estado;

    public function __construct(array $data)
    {
        $this->validateNotAllowedFields($data);
        $this->validateRequired($data);

        $this->tipoFrasco = $this->validateTipoFrasco($data['tipo_frasco']);
        $this->volumeTotal = $this->validateVolumeTotal($data['volume_total']);
        $this->estado = array_key_exists('estado', $data) ? $this->validateEstado($data['estado']) : null;
    }

    private function validateNotAllowedFields(array $data): void
    {
        $notAllowed = ['id', 'deleted_at'];
        foreach ($notAllowed as $field) {
            if (array_key_exists($field, $data)) {
                throw new InvalidArgumentException("Campo '{$field}' não pode ser informado.");
            }
        }
    }

    private function validateRequired(array $data): void
    {
        $required = ['tipo_frasco', 'volume_total'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                throw new InvalidArgumentException("Campo '{$field}' é obrigatório.");
            }
        }
    }

    private function validateTipoFrasco(mixed $tipo): TipoFrascoEnum
    {
        if (!is_string($tipo)) {
            throw new InvalidArgumentException("Campo 'tipo_frasco' deve ser um texto.");
        }

        // Comparação exata: sem trim e sem conversão de maiúsculas/minúsculas
        $enum = TipoFrascoEnum::tryFrom($tipo);
        if ($enum === null) {
            throw new InvalidArgumentException("Tipo de frasco inválido. Use: tampa_plastica_500ml ou graduado_200ml.");
        }
        return $enum;
    }

    private function validateVolumeTotal(mixed $volume): float
    {
        if (!is_int($volume) && !is_float($volume)) {
            throw new InvalidArgumentException("Campo 'volume_total' deve ser um número.");
        }
        if ($volume <= 0) {
            throw new InvalidArgumentException("Campo 'volume_total' deve ser maior que zero.");
        }
        if (round((float) $volume, 2) !== (float) $volume) {
            throw new InvalidArgumentException("Campo 'volume_total' deve ter no máximo duas casas decimais.");
        }
        return (float) $volume;
    }

    private function validateEstado(mixed $estado): EstadoFrascoEnum
    {
        if (!is_string($estado)) {
            throw new InvalidArgumentException("Campo 'estado' deve ser um texto.");
        }

        // Comparação exata: sem trim e sem conversão de maiúsculas/minúsculas
        $enum = EstadoFrascoEnum::tryFrom($estado);
        if ($enum === null) {
            $permitidos = implode(', ', array_column(EstadoFrascoEnum::cases(), 'value'));
            throw new InvalidArgumentException("Estado inválido. Use: {$permitidos}.");
        }
        return $enum;
    }
}

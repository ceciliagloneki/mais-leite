<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Frascos;

use MaisLeiteBackend\Enums\EstadoFrascoEnum;
use MaisLeiteBackend\Enums\TipoFrascoEnum;
use InvalidArgumentException;

final class UpdateFrascoDTO
{
    public readonly ?TipoFrascoEnum $tipoFrasco;
    public readonly ?float $volumeTotal;
    public readonly ?EstadoFrascoEnum $estado;

    private const ALLOWED_FIELDS = ['tipo_frasco', 'volume_total', 'estado'];

    public function __construct(array $data)
    {
        $this->validateAllowedFields($data);

        $this->tipoFrasco = array_key_exists('tipo_frasco', $data) ? $this->validateTipoFrasco($data['tipo_frasco']) : null;
        $this->volumeTotal = array_key_exists('volume_total', $data) ? $this->validateVolumeTotal($data['volume_total']) : null;
        $this->estado = array_key_exists('estado', $data) ? $this->validateEstado($data['estado']) : null;
    }

    private function validateAllowedFields(array $data): void
    {
        $notAllowed = ['id', 'deleted_at'];
        foreach ($notAllowed as $field) {
            if (array_key_exists($field, $data)) {
                throw new InvalidArgumentException("Campo '{$field}' não pode ser alterado.");
            }
        }

        if (array_intersect(array_keys($data), self::ALLOWED_FIELDS) === []) {
            throw new InvalidArgumentException("Nenhum campo para atualizar.");
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

    public function toArray(): array
    {
        $data = [];

        if ($this->tipoFrasco !== null) {
            $data['tipo_frasco'] = $this->tipoFrasco->value;
        }
        if ($this->volumeTotal !== null) {
            $data['volume_total'] = $this->volumeTotal;
        }
        if ($this->estado !== null) {
            $data['estado'] = $this->estado->value;
        }

        return $data;
    }
}

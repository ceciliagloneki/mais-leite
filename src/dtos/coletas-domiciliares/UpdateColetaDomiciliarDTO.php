<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\ColetasDomiciliares;

use MaisLeiteBackend\Enums\StatusColetaEnum;
use InvalidArgumentException;

final class UpdateColetaDomiciliarDTO
{
    public readonly ?string $data;
    public readonly ?string $horaColeta;
    public readonly ?float $volumeDoado;
    public readonly ?StatusColetaEnum $status;

    private const ALLOWED_FIELDS = ['data', 'hora_coleta', 'volume_doado', 'status'];

    public function __construct(array $data)
    {
        $this->validateAllowedFields($data);

        $this->data = isset($data['data']) ? $this->validateDate($data['data']) : null;
        $this->horaColeta = isset($data['hora_coleta']) ? $this->validateTime($data['hora_coleta']) : null;
        $this->volumeDoado = isset($data['volume_doado']) ? $this->validateVolume($data['volume_doado']) : null;
        $this->status = isset($data['status']) ? $this->validateStatus($data['status']) : null;

        $this->validateStatusRules($data);
    }

    private function validateAllowedFields(array $data): void
    {
        $notAllowed = ['funcionario_id', 'doadora_id', 'id'];
        foreach ($notAllowed as $field) {
            if (isset($data[$field])) {
                throw new InvalidArgumentException("Campo '{$field}' não pode ser alterado.");
            }
        }

        if (empty($data)) {
            throw new InvalidArgumentException("Nenhum campo para atualizar.");
        }
    }

    private function validateDate(string $date): string
    {
        $d = \DateTime::createFromFormat('Y-m-d', $date);
        if (!$d || $d->format('Y-m-d') !== $date) {
            throw new InvalidArgumentException("Data inválida. Use o formato YYYY-MM-DD.");
        }
        return $date;
    }

    private function validateTime(string $time): string
    {
        if (!preg_match('/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/', $time)) {
            throw new InvalidArgumentException("Horário inválido. Use o formato HH:MM ou HH:MM:SS.");
        }
        return $time;
    }

    private function validateVolume(mixed $volume): float
    {
        $vol = (float) $volume;
        if ($vol <= 0) {
            throw new InvalidArgumentException("Volume doado deve ser maior que zero.");
        }
        return $vol;
    }

    private function validateStatus(string $status): StatusColetaEnum
    {
        $enum = StatusColetaEnum::tryFrom($status);
        if ($enum === null) {
            throw new InvalidArgumentException("Status inválido. Use: agendada, realizada ou cancelada.");
        }
        return $enum;
    }

    private function validateStatusRules(array $data): void
    {
        if ($this->status === StatusColetaEnum::REALIZADA) {
            if (!isset($data['hora_coleta']) && $this->horaColeta === null) {
                throw new InvalidArgumentException("Horário é obrigatório ao alterar para realizada.");
            }
            if (!isset($data['volume_doado']) && $this->volumeDoado === null) {
                throw new InvalidArgumentException("Volume doado é obrigatório ao alterar para realizada.");
            }
        }
    }

    public function toArray(): array
    {
        $data = [];

        if ($this->data !== null) {
            $data['data'] = $this->data;
        }
        if ($this->horaColeta !== null) {
            $data['hora_coleta'] = $this->horaColeta;
        }
        if ($this->volumeDoado !== null) {
            $data['volume_doado'] = $this->volumeDoado;
        }
        if ($this->status !== null) {
            $data['status'] = $this->status->value;
        }

        return $data;
    }
}

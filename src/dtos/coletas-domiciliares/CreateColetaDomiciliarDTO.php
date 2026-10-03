<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\ColetasDomiciliares;

use MaisLeiteBackend\Enums\StatusColetaEnum;
use InvalidArgumentException;

final class CreateColetaDomiciliarDTO
{
    public readonly int $funcionarioId;
    public readonly int $doadoraId;
    public readonly string $data;
    public readonly ?string $horaColeta;
    public readonly ?float $volumeDoado;
    public readonly StatusColetaEnum $status;

    public function __construct(array $data)
    {
        $this->validateRequired($data);

        $this->funcionarioId = (int) $data['funcionario_id'];
        $this->doadoraId = (int) $data['doadora_id'];
        $this->data = $this->validateDate($data['data']);
        $this->status = $this->validateStatus($data['status'] ?? 'agendada');
        $this->horaColeta = isset($data['hora_coleta']) ? $this->validateTime($data['hora_coleta']) : null;
        $this->volumeDoado = isset($data['volume_doado']) ? $this->validateVolume($data['volume_doado']) : null;

        $this->validateStatusRules();
    }

    private function validateRequired(array $data): void
    {
        $required = ['funcionario_id', 'doadora_id', 'data'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                throw new InvalidArgumentException("Campo '{$field}' é obrigatório.");
            }
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

    private function validateStatusRules(): void
    {
        if ($this->status === StatusColetaEnum::REALIZADA) {
            if ($this->horaColeta === null) {
                throw new InvalidArgumentException("Horário é obrigatório para coleta realizada.");
            }
            if ($this->volumeDoado === null) {
                throw new InvalidArgumentException("Volume doado é obrigatório para coleta realizada.");
            }
        }
    }
}

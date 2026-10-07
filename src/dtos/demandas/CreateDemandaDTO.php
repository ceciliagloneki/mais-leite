<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Demandas;
use MaisLeiteBackend\Enums\StatusSolicitacaoEnum;
use InvalidArgumentException;

final class CreateDemandaDTO
{
    public readonly int    $hospital_id;
    public readonly float  $volume_total;
    public readonly int    $numero_de_bebes;
    public readonly string $data_demanda;
    public readonly StatusSolicitacaoEnum $status_solicitacao;

    public function __construct(array $data) {
        $this->validateRequired($data);

        $this->hospital_id        = (int) $data['hospital_id'];
        $this->volume_total       = $this->validateVolume($data['volume_total']);
        $this->numero_de_bebes    = $this->validateNumBebes($data['numero_de_bebes']);
        $this->data_demanda       = $this->validateData($data['data_demanda']);
        $this->status_solicitacao = isset($data['status_solicitacao']) ? $this->validateStatus($data['status_solicitaco']) : StatusSolicitacaoEnum::PENDENTE;
    }

    private function validateRequired(array $data) : void {
        $required = ['hospital_id', 'volume_total', 'numero_de_bebes', 'data_demanda'];

        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '')
                throw new InvalidArgumentException("Campo '{$field}' é obrigatório!");
        }
    }

    private function validateNumBebes(int $numero) : int {
        if ($numero <= 0)
            throw new InvalidArgumentException("Número de bebês deve ser maior que 0!");

        return $numero;
    }

    private function validateVolume(mixed $volume) : float {
        $vol = (float) $volume;
        if ($vol <= 0)
            throw new InvalidArgumentException("Volume requisitado deve ser maior que zero!");

        return $vol;
    }
    
    private function validateData(string $data) : string {
        $d = \DateTime::createFromFormat('Y-m-d', $data);
        if (!$d || $d->format('Y-m-d') !== $data)
            throw new InvalidArgumentException("Data é Inválida! Use o formato YYYY-mm-dd!");

        return $data;
    }

    private function validateStatus(string $status): StatusSolicitacaoEnum {
        $enum = StatusSolicitacaoEnum::tryFrom($status);

        if ($enum === null)
            throw new InvalidArgumentException("Status inválido! Use: pendente, aprovada, atendida ou cancelada.");

        return $enum;
    }
}
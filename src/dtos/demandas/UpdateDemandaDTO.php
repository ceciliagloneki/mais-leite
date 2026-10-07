<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Demandas;

use MaisLeiteBackend\Enums\StatusSolicitacaoEnum;
use InvalidArgumentException;

final class UpdateDemandaDTO
{
    public readonly ?float  $volume_total;
    public readonly ?int    $numero_de_bebes;
    public readonly ?string $data_demanda;
    public readonly ?StatusSolicitacaoEnum $status_solicitacao;

    private const ALLOWED_FIELDS = ['volume_total', 'numero_de_bebes', 'data_demanda', 'status_solicitacao'];

    public function __construct(array $data) {
        $this->validateAllowedFields($data);

        $this->volume_total       = isset($data['volume_total']) ? $this->validateVolume($data['volume_total']) : null;
        $this->numero_de_bebes    = isset($data['numero_de_bebes']) ? $this->validateNumBebes($data['numero_de_bebes']) : null;
        $this->data_demanda       = isset($data['data_demanda']) ? $this->validateData($data['data_demanda']) : null;
        $this->status_solicitacao = isset($data['status_solicitacao']) ? $this->validateStatus($data['status_solicitacao']) : null;
    }

    public function validateAllowedFields(array $data) : void {
        $not_allowed = ['hospital_id', 'id'];

        foreach ($not_allowed as $field) {
            if (isset($data[$field]))
                throw new InvalidArgumentException("Campo '{$field}' não pose ser alterado!");
        }

        if (empty($data))
            throw new InvalidArgumentException("Nenhum campo para atualizar");
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

    public function toArray() : array {
        $data = [];

        if ($this->volume_total !== null)
            $data['volume_total'] = $this->volume_total;

        if ($this->numero_de_bebes !== null)
            $data['numero_de_bebes'] = $this->numero_de_bebes;

        if ($this->data_demanda !== null) 
            $data['data_demanda'] = $this->data_demanda;

        if ($this->status_solicitacao !== null)
            $data['status_solicitacao'] = $this->status_solicitacao->value;

        return $data;
    }
}
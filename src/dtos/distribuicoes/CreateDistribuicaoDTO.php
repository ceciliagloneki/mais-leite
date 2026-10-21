<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Distribuicoes;
use InvalidArgumentException;

final class CreateDistribuicaoDTO
{
    public readonly int $demandaId;
    public readonly string $data;
    public readonly string $horario;
    public readonly string $assinaturaEntrega;
    public readonly string $assinaturaRecebimento;

    public function __construct (array $data) {
        $this->validateRequired($data);

        $this->demandaId = (int) $data['demanda_id'];
        $this->data       = $this->validateData($data['data']);
        $this->horario    = $this->validateHora($data['horario']);
        $this->assinaturaEntrega     = $this->validateAss($data['assinatura_entrega']);
        $this->assinaturaRecebimento = $this->validateAss($data['assinatura_recebimento']);
    }

    public function validateRequired (array $data) : void {
        $required = ['demanda_id','data','horario','assinatura_entrega','assinatura_recebimento'];

        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '')
                throw new InvalidArgumentException("Campo '{$field}' é obrigatório!");
        }
    }

    private function validateData (string $data) : string {
        $d = \DateTime::createFromFormat('Y-m-d', $data);
        
        if (!$d || $d->format('Y-m-d') !== $data)
            throw new InvalidArgumentException("Data é Inválida! Use o formato `AAAA-mm-dd`!");
    
        return $data;
    }

    private function validateHora (string $horario) : string {
        $h = \DateTime::createFromFormat('H:i', $horario);

        if (!$h || $h->format('H:i') !== $horario)
            throw new InvalidArgumentException("Horário é Inválido! Use o formato `HH:mm`!");

        return $horario;
    }

    private function validateAss (string $assinatura) : string {
        $ass = trim($assinatura);

        if ($ass === '')
            throw new InvalidArgumentException("Assinatura não pode ser vazia!");

        if (mb_strlen($ass, 'UTF-8') > 255)
            throw new InvalidArgumentException("O tamanho da Assinatura não pode exceder 255 caractéres!");

        return $assinatura;
    }
}
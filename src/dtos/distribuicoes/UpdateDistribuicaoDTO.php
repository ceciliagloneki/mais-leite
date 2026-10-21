<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Distribuicoes;

use InvalidArgumentException;

final class UpdateDistribuicaoDTO
{
    public readonly ?int $demandaId;
    public readonly ?string $data;
    public readonly ?string $horario;
    public readonly ?string $assinaturaEntrega;
    public readonly ?string $assinaturaRecebimento;

    public function __construct(array $data) {
        $this->validateAllowedFields($data);

        $this->demandaId = isset($data['demanda_id']) ? (int) $data['demanda_id'] : null;
        $this->data      = isset($data['data']) ? $this->validateData($data['data']) : null;
        $this->horario   = isset($data['horario']) ? $this->validateHora($data['horario']) : null;
        $this->assinaturaEntrega     = isset($data['assinatura_entrega']) ? $this->validateAss($data['assinatura_entrega']) : null;
        $this->assinaturaRecebimento = isset($data['assinatura_recebimento']) ? $this->validateAss($data['assinatura_recebimento']) : null;
    }

    public function validateAllowedFields(array $data) : void {
        $notAllowed = ['id', 'deleted_at'];

        foreach ($notAllowed as $field) {
            if (isset($data[$field]))
                throw new InvalidArgumentException("Campo '{$field}' não pode ser alterado!");
        }

        if (empty($data))
            throw new InvalidArgumentException("Nenhum campo para atualizar!");
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

    public function toArray() : array {
        $data = [];

        if ($this->demandaId !== null)
            $data['demanda_id'] = $this->demandaId;

        if ($this->data !== null)
            $data['data'] = $this->data;

        if ($this->horario !== null)
            $data['horario'] = $this->horario;

        if ($this->assinaturaEntrega !== null)
            $data['assinatura_entrega'] = $this->assinaturaEntrega;

        if ($this->assinaturaRecebimento !== null)
            $data['assinatura_recebimento'] = $this->assinaturaRecebimento;
    
        return $data;
    }
}
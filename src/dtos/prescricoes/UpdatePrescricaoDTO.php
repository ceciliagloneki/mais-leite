<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Prescricoes;

use MaisLeiteBackend\Enums\TipoLeiteEnum;
use InvalidArgumentException;

final class UpdatePrescricaoDTO
{
    public readonly ?float $volume_prescrito;
    public readonly ?string $nome_do_rn;
    public readonly ?TipoLeiteEnum $tipo_leite;

    public function __construct(array $data) {
        $this->validateAllowedFields($data);

        $this->volume_prescrito = isset($data['volume_prescrito']) ? $this->validateVolume($data['volume_prescrito']) : null;
        $this->nome_do_rn       = isset($data['nome_do_rn']) ? $this->validateNome($data['nome_do_rn']) : null;
        $this->tipo_leite       = isset($data['tipo_leite']) ? $this->validateTipoLeite($data['tipo_leite']) : null;
    }

    public function validateAllowedFields(array $data) : void {
        $not_allowed = ['demanda_id', 'id', 'deleted_at'];

        foreach ($not_allowed as $field) {
            if (isset($data[$field]))
                throw new InvalidArgumentException("Campo '{$field}' não pode ser alterado!");
        }

        if (empty($data))
            throw new InvalidArgumentException("Nenhum campo para atualizar!");
    }

    private function validateVolume(mixed $volume) : float {
        $vol = (float) $volume;
        if ($vol <= 0)
            throw new InvalidArgumentException("Volume prescrito deve ser maior que zero!");

        return $vol;
    }

    private function validateNome(string $nome) : string {
        $nome = trim($nome);

        if ($nome === '')
            throw new InvalidArgumentException("Campo 'nome_do_rn' é obrigatório!");

        if (mb_strlen($nome, 'UTF-8') > 100)
            throw new InvalidArgumentException("'nome_do_rn' não pode ser maior que 100 caracteres!");

        return $nome;
    }

    private function validateTipoLeite(string $tipo) : TipoLeiteEnum {
        $enum = TipoLeiteEnum::tryFrom(strtolower($tipo));

        if ($enum === null)
            throw new InvalidArgumentException(("Tipo de Leite Inválido! use [colostro, transicao ou maduro]!"));

        return $enum;
    }

    public function toArray() : array {
        $data = [];

        if($this->volume_prescrito !== null)
            $data['volume_prescrito'] = $this->volume_prescrito;
        
        if($this->nome_do_rn !== null)
            $data['nome_do_rn'] = $this->nome_do_rn;

        if($this->tipo_leite !== null)
            $data['tipo_leite'] = $this->tipo_leite->value;

        return $data;
    }
}
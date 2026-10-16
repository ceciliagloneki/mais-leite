<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Prescricoes;
use MaisLeiteBackend\Enums\TipoLeiteEnum;
use InvalidArgumentException;

final class CreatePrescricaoDTO
{
    public readonly int    $demanda_id;
    public readonly float  $volume_prescrito;
    public readonly string $nome_do_rn;
    public readonly TipoLeiteEnum $tipo_leite;

    public function __construct(array $data) {
        $this->validateRequired($data);

        $this->demanda_id       = (int) $data['demanda_id'];
        $this->volume_prescrito = $this->validateVolume($data['volume_prescrito']);
        $this->nome_do_rn       = $this->validateNome($data['nome_do_rn']);
        $this->tipo_leite       = $this->validateTipoLeite($data['tipo_leite']);
    }

    public function validateRequired(array $data) : void {
        $required =['demanda_id', 'volume_prescrito', 'nome_do_rn', 'tipo_leite'];

        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '')
                throw new InvalidArgumentException("Campo '{$field}' é obrigatório!");
        }
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
        $enum = TipoLeiteEnum::tryFrom($tipo);

        if ($enum === null)
            throw new InvalidArgumentException(("Tipo de Leite Inválido! use [colostro, transicao ou maduro]!"));

        return $enum;
    }
}
<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Pasteurizacoes;

use MaisLeiteBackend\Enums\TipoLeiteEnum;
use MaisLeiteBackend\Utils\Validation;
use InvalidArgumentException;

final class CreateFrascoPasteurizadoDTO
{
    public readonly int $doadoraId;
    public readonly float $volume;
    public readonly ?string $classificacao;

    public function __construct(array $data)
    {
        $this->doadoraId = Validation::int($data, 'doadora_id');
        $this->volume = Validation::number($data, 'volume');
        $this->classificacao = Validation::option($data, 'classificacao', TipoLeiteEnum::values(), false);

        if ($this->volume <= 0) {
            throw new InvalidArgumentException("O volume do frasco deve ser maior que zero.");
        }
    }
}

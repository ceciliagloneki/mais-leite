<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Hospitais;

use MaisLeiteBackend\Enums\TipoLeiteEnum;
use MaisLeiteBackend\Utils\Validation;
use InvalidArgumentException;

final class CreatePrescricaoDTO
{
    public readonly string $nomeDoRn;
    public readonly float $volumePrescrito;
    public readonly string $tipoLeite;

    public function __construct(array $data)
    {
        $this->nomeDoRn = Validation::text($data, 'nome_do_rn');
        $this->volumePrescrito = Validation::number($data, 'volume_prescrito');
        $this->tipoLeite = Validation::option($data, 'tipo_leite', TipoLeiteEnum::values());

        if ($this->volumePrescrito <= 0) {
            throw new InvalidArgumentException("O volume prescrito deve ser maior que zero.");
        }
    }
}

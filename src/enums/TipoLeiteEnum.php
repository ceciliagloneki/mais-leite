<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Enums;

enum TipoLeiteEnum: string
{
    case COLOSTRO = 'colostro';
    case TRANSICAO = 'transicao';
    case MADURO = 'maduro';

    public function rotulo(): string
    {
        return match ($this) {
            self::COLOSTRO => 'colostro',
            self::TRANSICAO => 'transição',
            self::MADURO => 'maduro',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function porDataDoParto(string $dataParto, string $dataColeta): self
    {
        $dias = (int) (new \DateTimeImmutable(substr($dataParto, 0, 10)))
            ->diff(new \DateTimeImmutable(substr($dataColeta, 0, 10)))
            ->format('%r%a');

        return match (true) {
            $dias <= 7 => self::COLOSTRO,
            $dias <= 14 => self::TRANSICAO,
            default => self::MADURO,
        };
    }
}

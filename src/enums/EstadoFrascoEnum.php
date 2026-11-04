<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Enums;

enum EstadoFrascoEnum: string
{
    case COLETA_DOMICILIAR = 'coleta_domiciliar';
    case RECEPCAO_INSPECAO = 'recepcao_inspecao';
    case PROCESSAMENTO = 'processamento';
    case PREPARO_LIBERACAO = 'preparo_liberacao';
    case DISTRIBUICAO = 'distribuicao';
    case DEVOLVIDO = 'devolvido';
    case DESCARTADO = 'descartado';

    /**
     * Próximas etapas permitidas a partir do estado atual.
     *
     * @return EstadoFrascoEnum[]
     */
    public function proximosEstados(): array
    {
        return match ($this) {
            self::COLETA_DOMICILIAR => [self::RECEPCAO_INSPECAO],
            // Conforme segue para processamento; não conforme é descartado
            self::RECEPCAO_INSPECAO => [self::PROCESSAMENTO, self::DESCARTADO],
            self::PROCESSAMENTO => [self::PREPARO_LIBERACAO],
            self::PREPARO_LIBERACAO => [self::DISTRIBUICAO],
            self::DISTRIBUICAO => [self::DEVOLVIDO],
            // Frasco devolvido volta ao ciclo
            self::DEVOLVIDO => [self::COLETA_DOMICILIAR],
            // Estado final
            self::DESCARTADO => [],
        };
    }

    public function podeTransicionarPara(self $novoEstado): bool
    {
        return in_array($novoEstado, $this->proximosEstados(), true);
    }
}

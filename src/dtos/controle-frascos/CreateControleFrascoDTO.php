<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\ControleFrascos;

use MaisLeiteBackend\Enums\TipoFrascoEnum;
use InvalidArgumentException;

final class CreateControleFrascoDTO
{
    public readonly int $visitaColetaId;
    public readonly TipoFrascoEnum $tipoFrasco;
    public readonly int $qtdEnviada;
    public readonly int $qtdRecebida;

    public function __construct(array $data)
    {
        $this->validateNotAllowedFields($data);
        $this->validateRequired($data);

        $this->visitaColetaId = $this->validateId($data['visita_coleta_id']);
        $this->tipoFrasco = $this->validateTipoFrasco($data['tipo_frasco']);
        $this->qtdEnviada = $this->validateQuantidade($data['qtd_enviada'], 'qtd_enviada');
        $this->qtdRecebida = isset($data['qtd_recebida'])
            ? $this->validateQuantidade($data['qtd_recebida'], 'qtd_recebida')
            : 0;

        $this->validateQuantidades();
    }

    private function validateNotAllowedFields(array $data): void
    {
        $notAllowed = ['id', 'deleted_at'];
        foreach ($notAllowed as $field) {
            if (array_key_exists($field, $data)) {
                throw new InvalidArgumentException("Campo '{$field}' não pode ser informado.");
            }
        }
    }

    private function validateRequired(array $data): void
    {
        $required = ['visita_coleta_id', 'tipo_frasco', 'qtd_enviada'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                throw new InvalidArgumentException("Campo '{$field}' é obrigatório.");
            }
        }
    }

    private function validateId(mixed $id): int
    {
        if (!is_int($id) || $id <= 0) {
            throw new InvalidArgumentException("Campo 'visita_coleta_id' deve ser um número inteiro positivo.");
        }
        return $id;
    }

    private function validateTipoFrasco(mixed $tipo): TipoFrascoEnum
    {
        if (!is_string($tipo) || trim($tipo) === '') {
            throw new InvalidArgumentException("Campo 'tipo_frasco' deve ser um texto não vazio.");
        }
        if (preg_match_all('/./us', $tipo) > 100) {
            throw new InvalidArgumentException("Campo 'tipo_frasco' deve ter no máximo 100 caracteres.");
        }

        $enum = TipoFrascoEnum::tryFrom($tipo);
        if ($enum === null) {
            throw new InvalidArgumentException("Tipo de frasco inválido. Use: tampa_plastica_500ml ou graduado_200ml.");
        }
        return $enum;
    }

    private function validateQuantidade(mixed $qtd, string $field): int
    {
        if (!is_int($qtd) || $qtd < 0) {
            throw new InvalidArgumentException("Campo '{$field}' deve ser um número inteiro maior ou igual a zero.");
        }
        return $qtd;
    }

    private function validateQuantidades(): void
    {
        if ($this->qtdRecebida > $this->qtdEnviada) {
            throw new InvalidArgumentException("Quantidade recebida não pode ser maior que a quantidade enviada.");
        }
    }
}

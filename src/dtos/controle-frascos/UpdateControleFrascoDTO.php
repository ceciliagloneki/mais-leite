<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\ControleFrascos;

use MaisLeiteBackend\Enums\TipoFrascoEnum;
use InvalidArgumentException;

final class UpdateControleFrascoDTO
{
    public readonly ?TipoFrascoEnum $tipoFrasco;
    public readonly ?int $qtdEnviada;
    public readonly ?int $qtdRecebida;

    private const ALLOWED_FIELDS = ['tipo_frasco', 'qtd_enviada', 'qtd_recebida'];

    public function __construct(array $data)
    {
        $this->validateAllowedFields($data);

        $this->tipoFrasco = array_key_exists('tipo_frasco', $data) ? $this->validateTipoFrasco($data['tipo_frasco']) : null;
        $this->qtdEnviada = array_key_exists('qtd_enviada', $data) ? $this->validateQuantidade($data['qtd_enviada'], 'qtd_enviada') : null;
        $this->qtdRecebida = array_key_exists('qtd_recebida', $data) ? $this->validateQuantidade($data['qtd_recebida'], 'qtd_recebida') : null;

        $this->validateQuantidades();
    }

    private function validateAllowedFields(array $data): void
    {
        $notAllowed = ['id', 'visita_coleta_id', 'deleted_at'];
        foreach ($notAllowed as $field) {
            if (array_key_exists($field, $data)) {
                throw new InvalidArgumentException("Campo '{$field}' não pode ser alterado.");
            }
        }

        if (array_intersect(array_keys($data), self::ALLOWED_FIELDS) === []) {
            throw new InvalidArgumentException("Nenhum campo para atualizar.");
        }
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
        // Quando só uma das quantidades é enviada, a comparação é feita no Service com o valor salvo
        if ($this->qtdEnviada !== null && $this->qtdRecebida !== null && $this->qtdRecebida > $this->qtdEnviada) {
            throw new InvalidArgumentException("Quantidade recebida não pode ser maior que a quantidade enviada.");
        }
    }

    public function toArray(): array
    {
        $data = [];

        if ($this->tipoFrasco !== null) {
            $data['tipo_frasco'] = $this->tipoFrasco->value;
        }
        if ($this->qtdEnviada !== null) {
            $data['qtd_enviada'] = $this->qtdEnviada;
        }
        if ($this->qtdRecebida !== null) {
            $data['qtd_recebida'] = $this->qtdRecebida;
        }

        return $data;
    }
}

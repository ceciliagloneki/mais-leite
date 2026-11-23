<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Utils;

use DateTime;
use InvalidArgumentException;

final class Validation
{
    public static function text(array $data, string $field, bool $required = true): ?string
    {
        $value = trim((string) ($data[$field] ?? ''));

        if ($value === '') {
            return self::empty($field, $required);
        }

        return $value;
    }

    public static function int(array $data, string $field, bool $required = true): ?int
    {
        $value = self::text($data, $field, $required);

        if ($value === null) {
            return null;
        }
        if (!ctype_digit($value)) {
            throw new InvalidArgumentException("Campo '{$field}' deve ser um número inteiro.");
        }

        return (int) $value;
    }

    public static function number(array $data, string $field, bool $required = true): ?float
    {
        $value = self::text($data, $field, $required);

        if ($value === null) {
            return null;
        }
        if (!is_numeric($value)) {
            throw new InvalidArgumentException("Campo '{$field}' deve ser numérico.");
        }

        return (float) $value;
    }

    public static function bool(array $data, string $field): bool
    {
        return in_array($data[$field] ?? false, [true, 1, '1', 'true', 'on'], true);
    }

    public static function date(array $data, string $field, bool $required = true): ?string
    {
        return self::format($data, $field, 'Y-m-d', $required);
    }

    public static function month(array $data, string $field, bool $required = true): ?string
    {
        return self::format($data, $field, 'Y-m', $required);
    }

    public static function time(array $data, string $field, bool $required = true): ?string
    {
        return self::format($data, $field, 'H:i', $required);
    }

    public static function dateTime(array $data, string $field, bool $required = true): ?string
    {
        $value = self::format($data, $field, 'Y-m-d\TH:i', $required);

        return $value === null ? null : str_replace('T', ' ', $value) . ':00';
    }

    public static function option(array $data, string $field, array $options, bool $required = true): ?string
    {
        $value = self::text($data, $field, $required);

        if ($value !== null && !in_array($value, $options, true)) {
            throw new InvalidArgumentException("Campo '{$field}' inválido. Use: " . implode(', ', $options) . '.');
        }

        return $value;
    }

    public static function ids(array $data, string $field): array
    {
        $values = $data[$field] ?? [];

        if (!is_array($values) || $values === []) {
            throw new InvalidArgumentException("Selecione pelo menos um item em '{$field}'.");
        }

        $ids = [];
        foreach ($values as $value) {
            if (!ctype_digit((string) $value)) {
                throw new InvalidArgumentException("Campo '{$field}' possui um ID inválido.");
            }
            $ids[] = (int) $value;
        }

        return array_values(array_unique($ids));
    }

    private static function format(array $data, string $field, string $format, bool $required): ?string
    {
        $value = self::text($data, $field, $required);

        if ($value === null) {
            return null;
        }

        $date = DateTime::createFromFormat($format, $value);
        if (!$date || $date->format($format) !== $value) {
            throw new InvalidArgumentException("Campo '{$field}' com data ou horário inválido.");
        }

        return $value;
    }

    private static function empty(string $field, bool $required): ?string
    {
        if ($required) {
            throw new InvalidArgumentException("Campo '{$field}' é obrigatório.");
        }

        return null;
    }
}

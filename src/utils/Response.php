<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Utils;

/**
 * Helper para padronizar respostas HTTP em JSON.
 */
final class Response
{
    public static function json(mixed $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }

    public static function error(string $message, int $status = 400): void
    {
        self::json(['error' => $message], $status);
    }
}

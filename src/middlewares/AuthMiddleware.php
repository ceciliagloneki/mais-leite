<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Middlewares;

use MaisLeiteBackend\Utils\Jwt;
use MaisLeiteBackend\Utils\Response;
use InvalidArgumentException;

/**
 * Middleware de autenticação para rotas protegidas.
 * Verifica a presença e a validade do token JWT no cabeçalho Authorization.
 */
final class AuthMiddleware
{
    /**
     * Executa a verificação de autenticação.
     * Em caso de falha, responde com 401 e interrompe a requisição.
     */
    public static function handle(): array
    {
        $token = self::extractToken();

        if ($token === null) {
            Response::error('Token de autenticação não fornecido.', 401);
            exit;
        }

        try {
            return Jwt::decode($token);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 401);
            exit;
        }
    }

    private static function extractToken(): ?string
    {
        $header = self::authorizationHeader();

        if ($header === null) {
            return null;
        }

        if (preg_match('/^Bearer\s+(.+)$/i', trim($header), $matches) !== 1) {
            return null;
        }

        $token = trim($matches[1]);

        return $token === '' ? null : $token;
    }

    private static function authorizationHeader(): ?string
    {
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            return $_SERVER['HTTP_AUTHORIZATION'];
        }

        if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }

        if (function_exists('getallheaders')) {
            foreach (getallheaders() as $name => $value) {
                if (strcasecmp($name, 'Authorization') === 0) {
                    return $value;
                }
            }
        }

        return null;
    }
}

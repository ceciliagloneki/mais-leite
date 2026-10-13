<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Routes;

use MaisLeiteBackend\Middlewares\AuthMiddleware;
use MaisLeiteBackend\Utils\Response;

/**
 * Roteador simples: associa método HTTP + caminho a um callback.
 * Suporta parâmetros dinâmicos no formato /recurso/{id}.
 * Rotas podem ser marcadas como protegidas, exigindo autenticação.
 */
final class Router
{
    /** @var array<string, array<int, array{pattern: string, handler: callable, protected: bool}>> */
    private array $routes = [];

    public function get(string $path, callable $handler, bool $protected = true): void
    {
        $this->add('GET', $path, $handler, $protected);
    }

    public function post(string $path, callable $handler, bool $protected = true): void
    {
        $this->add('POST', $path, $handler, $protected);
    }

    public function put(string $path, callable $handler, bool $protected = true): void
    {
        $this->add('PUT', $path, $handler, $protected);
    }

    public function delete(string $path, callable $handler, bool $protected = true): void
    {
        $this->add('DELETE', $path, $handler, $protected);
    }

    private function add(string $method, string $path, callable $handler, bool $protected): void
    {
        $this->routes[$method][] = [
            'pattern' => $this->normalize($path),
            'handler' => $handler,
            'protected' => $protected,
        ];
    }

    public function dispatch(string $method, string $uri): void
    {
        $path = $this->normalize(parse_url($uri, PHP_URL_PATH) ?? '/');

        foreach ($this->routes[$method] ?? [] as $route) {
            $params = $this->match($route['pattern'], $path);

            if ($params !== null) {
                if ($route['protected']) {
                    AuthMiddleware::handle();
                }

                ($route['handler'])(...$params);
                return;
            }
        }

        Response::error('Rota não encontrada.', 404);
    }

    /**
     * Tenta casar o caminho requisitado com o padrão da rota.
     * Retorna os parâmetros capturados, ou null quando não há correspondência.
     *
     * @return array<int, string|int>|null
     */
    private function match(string $pattern, string $path): ?array
    {
        $patternParts = explode('/', $pattern);
        $pathParts = explode('/', $path);

        if (count($patternParts) !== count($pathParts)) {
            return null;
        }

        $params = [];

        foreach ($patternParts as $index => $part) {
            if (preg_match('/^\{[^}]+\}$/', $part) === 1) {
                $value = $pathParts[$index];
                $params[] = ctype_digit($value) ? (int) $value : $value;
                continue;
            }

            if ($part !== $pathParts[$index]) {
                return null;
            }
        }

        return $params;
    }

    private function normalize(string $path): string
    {
        $path = '/' . trim($path, '/');
        return $path === '/' ? '/' : rtrim($path, '/');
    }
}
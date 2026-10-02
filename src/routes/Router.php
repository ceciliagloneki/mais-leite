<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Routes;

use MaisLeiteBackend\Utils\Response;

/**
 * Roteador simples: associa método HTTP + caminho a um callback.
 */
final class Router
{
    /** @var array<string, array<string, callable>> */
    private array $routes = [];

    public function get(string $path, callable $handler): void
    {
        $this->add('GET', $path, $handler);
    }

    public function post(string $path, callable $handler): void
    {
        $this->add('POST', $path, $handler);
    }

    public function put(string $path, callable $handler): void
    {
        $this->add('PUT', $path, $handler);
    }

    public function delete(string $path, callable $handler): void
    {
        $this->add('DELETE', $path, $handler);
    }

    private function add(string $method, string $path, callable $handler): void
    {
        $this->routes[$method][$this->normalize($path)] = $handler;
    }

    public function dispatch(string $method, string $uri): void
    {
        $path = $this->normalize(parse_url($uri, PHP_URL_PATH) ?? '/');

        foreach ($this->routes[$method] ?? [] as $route => $handler) {
            $params = $this->match($route, $path);
            if ($params !== null) {
                $handler(...$params);
                return;
            }
        }

        Response::error('Rota não encontrada.', 404);
    }

    private function match(string $route, string $path): ?array
    {
        $pattern = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $route);
        $pattern = '#^' . $pattern . '$#';

        if (preg_match($pattern, $path, $matches)) {
            return array_filter($matches, fn($key) => !is_int($key), ARRAY_FILTER_USE_KEY);
        }

        return null;
    }

    private function normalize(string $path): string
    {
        $path = '/' . trim($path, '/');
        return $path === '/' ? '/' : rtrim($path, '/');
    }
}

<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Routes;

use MaisLeiteBackend\Middlewares\AuthMiddleware;
use MaisLeiteBackend\Utils\Response;
final class Router
{
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
    public function protectedGet(string $path, callable $handler): void
    {
        $this->add('GET', $path, $handler, true);
    }
    public function protectedPost(string $path, callable $handler): void
    {
        $this->add('POST', $path, $handler, true);
    }
    public function protectedPut(string $path, callable $handler): void
    {
        $this->add('PUT', $path, $handler, true);
    }
    public function protectedDelete(string $path, callable $handler): void
    {
        $this->add('DELETE', $path, $handler, true);
    }
    public function protectedPatch(string $path, callable $handler): void
    {
        $this->add('PATCH', $path, $handler, true);
    }
    public function patch(string $path, callable $handler): void
    {
        $this->add('PATCH', $path, $handler);
    }
    private function add(string $method, string $path, callable $handler, bool $protected = false): void
    {
        $this->routes[$method][] = ['pattern' => $this->normalize($path), 'handler' => $handler, 'protected' => $protected];
    }
    public function dispatch(string $method, string $uri): void
    {
        $path = $this->normalize(parse_url($uri, PHP_URL_PATH) ?? '/');
        foreach ($this->routes[$method] ?? [] as $route) {
            $params = $this->match($route['pattern'], $path);
            if ($params !== null) {
                if ($route['protected'] && !(new AuthMiddleware())->handle()) {
                    return;
                }
                $route['handler'](...$params);
                return;
            }
        }
        Response::error('Rota não encontrada.', 404);
    }
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
                if (!ctype_digit($pathParts[$index])) {
                    return null;
                }
                $params[] = (int) $pathParts[$index];
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

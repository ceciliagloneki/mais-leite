<?php

declare(strict_types=1);

use Dotenv\Dotenv;
use MaisLeiteBackend\Routes\Router;
use MaisLeiteBackend\Utils\Response;

require __DIR__ . '/../vendor/autoload.php';

// Carrega as variáveis de ambiente do arquivo .env
Dotenv::createImmutable(__DIR__ . '/..')->safeLoad();

try {
    /** @var Router $router */
    $router = require __DIR__ . '/../src/routes/routes.php';
    $router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
} catch (Throwable $e) {
    Response::error('Erro interno no servidor.', 500);
}

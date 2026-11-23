<?php

declare(strict_types=1);

use Dotenv\Dotenv;
use MaisLeiteBackend\Utils\Response;

require __DIR__ . '/../vendor/autoload.php';

Dotenv::createImmutable(__DIR__ . '/..')->safeLoad();
date_default_timezone_set('America/Sao_Paulo');

header('Access-Control-Allow-Origin: ' . ($_ENV['FRONTEND_URL'] ?? 'http://localhost:3000'));
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $router = require __DIR__ . '/../src/routes/routes.php';
    $router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
} catch (Throwable $e) {
    error_log((string) $e);
    Response::error('Erro interno. Confira se o banco está ativo e se as tabelas foram criadas (composer migrate).', 500);
}

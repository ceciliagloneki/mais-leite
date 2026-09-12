<?php

declare(strict_types=1);

use MaisLeiteBackend\Controllers\HealthController;
use MaisLeiteBackend\Routes\Router;

/**
 * Registro central das rotas da aplicação.
 * Novos endpoints devem ser adicionados aqui.
 */
$router = new Router();

$router->get('/', [new HealthController(), 'index']);

return $router;

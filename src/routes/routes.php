<?php

declare(strict_types=1);

use MaisLeiteBackend\Controllers\HealthController;
use MaisLeiteBackend\Controllers\FuncionarioController;
use MaisLeiteBackend\Routes\Router;

/**
 * Registro central das rotas da aplicação.
 * Novos endpoints devem ser adicionados aqui.
 */
$router = new Router();

$router->get('/', [new HealthController(), 'index']);

$funcionarioController = new FuncionarioController();

// Funcionários
$router->post('/funcionarios', [$funcionarioController, 'create']);
$router->get('/funcionarios', [$funcionarioController, 'findAll']);
$router->get('/funcionarios/{id}', [$funcionarioController, 'findById']);
$router->put('/funcionarios/{id}', [$funcionarioController, 'update']);
$router->delete('/funcionarios/{id}', [$funcionarioController, 'delete']);

return $router;

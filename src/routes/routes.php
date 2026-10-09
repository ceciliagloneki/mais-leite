<?php

declare(strict_types=1);

use MaisLeiteBackend\Controllers\AuthController;
use MaisLeiteBackend\Controllers\ColetaDomiciliarController;
use MaisLeiteBackend\Controllers\HealthController;
use MaisLeiteBackend\Controllers\FuncionarioController;
use MaisLeiteBackend\Routes\Router;

/**
 * Registro central das rotas da aplicação.
 * Novos endpoints devem ser adicionados aqui.
 *
 * O terceiro argumento ($protected) indica se a rota exige autenticação.
 * Por padrão as rotas são protegidas; rotas públicas devem passar `false`.
 */
$router = new Router();

$router->get('/', [new HealthController(), 'index'], false);

// Autenticação (rota pública)
$authController = new AuthController();
$router->post('/auth/login', [$authController, 'login'], false);

// Funcionários (rotas protegidas)
$funcionarioController = new FuncionarioController();
$router->post('/funcionarios', [$funcionarioController, 'create']);
$router->get('/funcionarios', [$funcionarioController, 'findAll']);
$router->get('/funcionarios/{id}', [$funcionarioController, 'findById']);
$router->put('/funcionarios/{id}', [$funcionarioController, 'update']);
$router->delete('/funcionarios/{id}', [$funcionarioController, 'delete']);

// Coletas Domiciliares (rotas protegidas)
$coletaController = new ColetaDomiciliarController();
$router->post('/coletas-domiciliares', [$coletaController, 'create']);
$router->get('/coletas-domiciliares', [$coletaController, 'findAll']);
$router->get('/coletas-domiciliares/{id}', [$coletaController, 'findById']);
$router->put('/coletas-domiciliares/{id}', [$coletaController, 'update']);
$router->delete('/coletas-domiciliares/{id}', [$coletaController, 'delete']);

return $router;

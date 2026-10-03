<?php

declare(strict_types=1);

use MaisLeiteBackend\Controllers\ColetaDomiciliarController;
use MaisLeiteBackend\Controllers\HealthController;
use MaisLeiteBackend\Routes\Router;

/**
 * Registro central das rotas da aplicação.
 * Novos endpoints devem ser adicionados aqui.
 */
$router = new Router();

$router->get('/', [new HealthController(), 'index']);

// Coletas Domiciliares
$coletaController = new ColetaDomiciliarController();
$router->post('/coletas-domiciliares', [$coletaController, 'create']);
$router->get('/coletas-domiciliares', [$coletaController, 'findAll']);
$router->get('/coletas-domiciliares/{id}', fn(string $id) => $coletaController->findById((int) $id));
$router->put('/coletas-domiciliares/{id}', fn(string $id) => $coletaController->update((int) $id));
$router->delete('/coletas-domiciliares/{id}', fn(string $id) => $coletaController->delete((int) $id));

return $router;

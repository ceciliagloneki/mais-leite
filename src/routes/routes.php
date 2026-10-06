<?php

declare(strict_types=1);

use HospitalController;
use MaisLeiteBackend\Controllers\HealthController;
use MaisLeiteBackend\Routes\Router;

/**
 * Registro central das rotas da aplicação.
 * Novos endpoints devem ser adicionados aqui.
 */
$router = new Router();

$router->get('/', [new HealthController(), 'index']);

$hospital_controller = new HospitalController();
$router->post('/hospital', [$hospital_controller, 'create']);
$router->get('/hospital', [$hospital_controller, 'findAll']);
$router->get('/hospital/{id}', [$hospital_controller, 'findById']);
$router->put('/hospital/{id}', [$hospital_controller, 'update']);
$router->delete('/hospital/{id}', [$hospital_controller, 'delete']);

return $router;

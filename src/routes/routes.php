<?php

declare(strict_types=1);

use MaisLeiteBackend\Controllers\ColetaDomiciliarController;
use MaisLeiteBackend\Controllers\HealthController;
use MaisLeiteBackend\Controllers\FuncionarioController;
use MaisLeiteBackend\Controllers\HospitalController;
use MaisLeiteBackend\Controllers\DemandaController;
use MaisLeiteBackend\Routes\Router;

/**
 * Registro central das rotas da aplicação.
 * Novos endpoints devem ser adicionados aqui.
 */
$router = new Router();

$router->get('/', [new HealthController(), 'index']);
// Hospitais
$hospital_controller = new HospitalController;
$router->post('/hospital', [$hospital_controller, 'create']);
$router->get('/hospital', [$hospital_controller, 'findAll']);
$router->get('/hospital/{id}', [$hospital_controller, 'findById']);
$router->put('/hospital/{id}', [$hospital_controller, 'update']);
$router->delete('/hospital/{id}', [$hospital_controller, 'delete']);

// Funcionários
$funcionarioController = new FuncionarioController();
$router->post('/funcionarios', [$funcionarioController, 'create']);
$router->get('/funcionarios', [$funcionarioController, 'findAll']);
$router->get('/funcionarios/{id}', [$funcionarioController, 'findById']);
$router->put('/funcionarios/{id}', [$funcionarioController, 'update']);
$router->delete('/funcionarios/{id}', [$funcionarioController, 'delete']);

// Coletas Domiciliares
$coletaController = new ColetaDomiciliarController();
$router->post('/coletas-domiciliares', [$coletaController, 'create']);
$router->get('/coletas-domiciliares', [$coletaController, 'findAll']);
$router->get('/coletas-domiciliares/{id}', [$coletaController, 'findById']);
$router->put('/coletas-domiciliares/{id}', [$coletaController, 'update']);
$router->delete('/coletas-domiciliares/{id}', [$coletaController, 'delete']);

// Demandas
$demanda_controller = new DemandaController();
$router->post('/demandas', [$demanda_controller, 'create']);
$router->get('/demandas', [$demanda_controller, 'findAll']);
$router->get('/demandas/{id}', [$demanda_controller, 'findById']);
$router->put('/demandas/{id}', [$demanda_controller, 'update']);
$router->delete('/demanda/{id}', [$demanda_controller, 'delete']);

return $router;

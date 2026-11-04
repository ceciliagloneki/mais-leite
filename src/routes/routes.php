<?php

declare(strict_types=1);

use MaisLeiteBackend\Controllers\AuthController;
use MaisLeiteBackend\Controllers\ColetaDomiciliarController;
use MaisLeiteBackend\Controllers\ControleFrascoController;
use MaisLeiteBackend\Controllers\FrascoController;
use MaisLeiteBackend\Controllers\HealthController;
use MaisLeiteBackend\Controllers\FuncionarioController;
use MaisLeiteBackend\Controllers\HospitalController;
use MaisLeiteBackend\Controllers\DemandaController;
use MaisLeiteBackend\Controllers\DistribuicaoController;
use MaisLeiteBackend\Controllers\PrescricaoController;
use MaisLeiteBackend\Routes\Router;

/**
 * Registro central das rotas da aplicação.
 * Novos endpoints devem ser adicionados aqui.
 *
 * O terceiro argumento ($protected) indica se a rota exige autenticação.
 * Por padrão as rotas são protegidas; rotas públicas devem passar `false`.
 */
$router = new Router();

$router->get('/', [new HealthController(), 'index']);
$router->get('/', [new HealthController(), 'index'], false);

// Hospitais
$hospital_controller = new HospitalController;
$router->post('/hospital', [$hospital_controller, 'create']);
$router->get('/hospital', [$hospital_controller, 'findAll']);
$router->get('/hospital/{id}', [$hospital_controller, 'findById']);
$router->put('/hospital/{id}', [$hospital_controller, 'update']);
$router->delete('/hospital/{id}', [$hospital_controller, 'delete']);

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

// Demandas
$demanda_controller = new DemandaController();
$router->post('/demandas', [$demanda_controller, 'create']);
$router->get('/demandas', [$demanda_controller, 'findAll']);
$router->get('/demandas/{id}', [$demanda_controller, 'findById']);
$router->put('/demandas/{id}', [$demanda_controller, 'update']);
$router->delete('/demandas/{id}', [$demanda_controller, 'delete']);

// Prescrições
$prescricao_controller = new PrescricaoController();
$router->post('/prescricoes', [$prescricao_controller, 'create']);
$router->get('/prescricoes', [$prescricao_controller, 'findAll']);
$router->get('/prescricoes/{id}', [$prescricao_controller, 'findById']);
$router->put('/prescricoes/{id}', [$prescricao_controller, 'update']);
$router->delete('/prescricoes/{id}', [$prescricao_controller, 'delete']);

// Distribuições
$distribuicao_controller = new DistribuicaoController();
$router->post('/distribuicoes', [$distribuicao_controller, 'create']);
$router->get('/distribuicoes', [$distribuicao_controller, 'findAll']);
$router->get('/distribuicoes/{id}', [$distribuicao_controller, 'findById']);
$router->put('/distribuicoes/{id}', [$distribuicao_controller, 'update']);
$router->delete('/distribuicoes/{id}', [$distribuicao_controller, 'delete']);

// Controle de Frascos
$controleFrascoController = new ControleFrascoController();
$router->post('/controle-frascos', [$controleFrascoController, 'create']);
$router->get('/controle-frascos', [$controleFrascoController, 'findAll']);
$router->get('/controle-frascos/{id}', fn(string $id) => $controleFrascoController->findById((int) $id));
$router->put('/controle-frascos/{id}', fn(string $id) => $controleFrascoController->update((int) $id));
$router->delete('/controle-frascos/{id}', fn(string $id) => $controleFrascoController->delete((int) $id));

// Frascos
$frascoController = new FrascoController();
$router->post('/frascos', [$frascoController, 'create']);
$router->get('/frascos', [$frascoController, 'findAll']);
$router->get('/frascos/{id}', fn(string $id) => $frascoController->findById((int) $id));
$router->put('/frascos/{id}', fn(string $id) => $frascoController->update((int) $id));
$router->delete('/frascos/{id}', fn(string $id) => $frascoController->delete((int) $id));

return $router;

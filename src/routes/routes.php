<?php

declare(strict_types=1);

use MaisLeiteBackend\Controllers\AuthController;
use MaisLeiteBackend\Controllers\ColetaDomiciliarController;
use MaisLeiteBackend\Controllers\DistribuicaoController;
use MaisLeiteBackend\Controllers\DoadoraController;
use MaisLeiteBackend\Controllers\FuncionarioController;
use MaisLeiteBackend\Controllers\HealthController;
use MaisLeiteBackend\Controllers\HospitalController;
use MaisLeiteBackend\Controllers\PasteurizacaoController;
use MaisLeiteBackend\Controllers\RecepcaoController;
use MaisLeiteBackend\Controllers\RelatorioController;
use MaisLeiteBackend\Routes\Router;

$router = new Router();

$router->get('/', [new HealthController(), 'index']);

$router->post('/auth/login', [new AuthController(), 'login']);

$funcionario = new FuncionarioController();
$router->protectedGet('/funcionarios', [$funcionario, 'findAll']);
$router->protectedGet('/funcionarios/{id}', [$funcionario, 'findById']);
$router->protectedPost('/funcionarios', [$funcionario, 'create']);
$router->protectedPut('/funcionarios/{id}', [$funcionario, 'update']);
$router->protectedDelete('/funcionarios/{id}', [$funcionario, 'delete']);

$doadora = new DoadoraController();
$router->protectedGet('/zonas', [$doadora, 'zonas']);
$router->protectedGet('/doadoras', [$doadora, 'findAll']);
$router->protectedGet('/doadoras/{id}', [$doadora, 'findById']);
$router->protectedPost('/doadoras', [$doadora, 'create']);
$router->protectedPut('/doadoras/{id}', [$doadora, 'update']);
$router->protectedPost('/doadoras/{id}/triagem', [$doadora, 'triagem']);
$router->protectedPost('/doadoras/{id}/sorologias', [$doadora, 'sorologia']);

$coleta = new ColetaDomiciliarController();
$router->protectedGet('/coletas', [$coleta, 'findAll']);
$router->protectedPost('/coletas', [$coleta, 'create']);
$router->protectedPost('/coletas/agendar', [$coleta, 'agendar']);
$router->protectedPut('/coletas/{id}/realizar', [$coleta, 'realizar']);
$router->protectedPut('/coletas/{id}/cancelar', [$coleta, 'cancelar']);
$router->protectedPost('/coletas/{id}/frascos', [$coleta, 'registrarFrasco']);
$router->protectedGet('/frascos-crus', [$coleta, 'frascos']);

$recepcao = new RecepcaoController();
$router->protectedGet('/recepcoes', [$recepcao, 'findAll']);
$router->protectedPost('/recepcoes', [$recepcao, 'create']);

$pasteurizacao = new PasteurizacaoController();
$router->protectedGet('/pasteurizacoes', [$pasteurizacao, 'findAll']);
$router->protectedPost('/pasteurizacoes', [$pasteurizacao, 'create']);
$router->protectedPost('/pasteurizacoes/{id}/frascos', [$pasteurizacao, 'reenvasar']);
$router->protectedGet('/frascos-pasteurizados', [$pasteurizacao, 'frascos']);
$router->protectedPost('/frascos-pasteurizados/{id}/analise', [$pasteurizacao, 'analisar']);

$hospital = new HospitalController();
$router->protectedGet('/hospitais', [$hospital, 'findAll']);
$router->protectedPost('/hospitais', [$hospital, 'create']);
$router->protectedPut('/hospitais/{id}', [$hospital, 'update']);
$router->protectedGet('/demandas', [$hospital, 'demandas']);
$router->protectedPost('/demandas', [$hospital, 'criarDemanda']);
$router->protectedGet('/prescricoes', [$hospital, 'prescricoes']);
$router->protectedPost('/demandas/{id}/prescricoes', [$hospital, 'criarPrescricao']);

$distribuicao = new DistribuicaoController();
$router->protectedGet('/alocacoes', [$distribuicao, 'alocacoes']);
$router->protectedPost('/alocacoes', [$distribuicao, 'alocar']);
$router->protectedPut('/alocacoes/{id}/administracao', [$distribuicao, 'administrar']);
$router->protectedGet('/distribuicoes', [$distribuicao, 'findAll']);
$router->protectedGet('/distribuicoes/{id}', [$distribuicao, 'findById']);
$router->protectedPost('/distribuicoes', [$distribuicao, 'create']);
$router->protectedGet('/devolucoes', [$distribuicao, 'devolucoes']);
$router->protectedPost('/devolucoes', [$distribuicao, 'registrarDevolucao']);

$relatorio = new RelatorioController();
$router->protectedGet('/dashboard', [$relatorio, 'dashboard']);
$router->protectedGet('/rastreabilidade/{id}', [$relatorio, 'rastreabilidade']);

return $router;

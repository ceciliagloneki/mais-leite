<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Controllers;

use MaisLeiteBackend\Dtos\Distribuicoes\CreateAdministracaoDTO;
use MaisLeiteBackend\Dtos\Distribuicoes\CreateAlocacaoDTO;
use MaisLeiteBackend\Dtos\Distribuicoes\CreateDevolucaoDTO;
use MaisLeiteBackend\Dtos\Distribuicoes\CreateDistribuicaoDTO;
use MaisLeiteBackend\Middlewares\AuthMiddleware;
use MaisLeiteBackend\Repositories\DemandaRepository;
use MaisLeiteBackend\Repositories\DevolucaoFrascosRepository;
use MaisLeiteBackend\Repositories\DistribuicaoRepository;
use MaisLeiteBackend\Repositories\FrascoDistribuicaoRepository;
use MaisLeiteBackend\Repositories\FrascoPasteurizadoRepository;
use MaisLeiteBackend\Repositories\HospitalRepository;
use MaisLeiteBackend\Repositories\PrescricaoRepository;
use MaisLeiteBackend\Services\DistribuicaoService;
use MaisLeiteBackend\Utils\Response;
use InvalidArgumentException;

final class DistribuicaoController
{
    private DistribuicaoService $service;

    public function __construct()
    {
        $this->service = new DistribuicaoService(
            new DistribuicaoRepository(),
            new FrascoDistribuicaoRepository(),
            new FrascoPasteurizadoRepository(),
            new PrescricaoRepository(),
            new DemandaRepository(),
            new HospitalRepository(),
            new DevolucaoFrascosRepository()
        );
    }

    public function alocacoes(): void
    {
        Response::json($this->service->findAlocacoes());
    }

    public function alocar(): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $id = $this->service->alocar(new CreateAlocacaoDTO($data));

            Response::json(['id' => $id], 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function administrar(int $id): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $this->service->registrarAdministracao($id, new CreateAdministracaoDTO($data));

            Response::json(['id' => $id]);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function findAll(): void
    {
        Response::json($this->service->findAll());
    }

    public function findById(int $id): void
    {
        $ficha = $this->service->findById($id);

        if ($ficha === null) {
            Response::error("Ficha de distribuição não encontrada.", 404);
            return;
        }

        Response::json($ficha);
    }

    public function create(): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $id = $this->service->create(new CreateDistribuicaoDTO($data), AuthMiddleware::$funcionarioId);

            Response::json(['id' => $id], 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function devolucoes(): void
    {
        Response::json($this->service->findDevolucoes());
    }

    public function registrarDevolucao(): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $id = $this->service->registrarDevolucao(new CreateDevolucaoDTO($data));

            Response::json(['id' => $id], 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}

<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Controllers;

use MaisLeiteBackend\Dtos\Doadoras\CreateDoadoraDTO;
use MaisLeiteBackend\Dtos\Doadoras\CreateSorologiaDTO;
use MaisLeiteBackend\Dtos\Doadoras\CreateTriagemDTO;
use MaisLeiteBackend\Middlewares\AuthMiddleware;
use MaisLeiteBackend\Repositories\DoadoraRepository;
use MaisLeiteBackend\Repositories\FrascoLeiteCruRepository;
use MaisLeiteBackend\Repositories\FrascoPasteurizadoRepository;
use MaisLeiteBackend\Repositories\SorologiaRepository;
use MaisLeiteBackend\Repositories\TriagemRepository;
use MaisLeiteBackend\Services\DoadoraService;
use MaisLeiteBackend\Utils\Response;
use InvalidArgumentException;

final class DoadoraController
{
    private DoadoraService $service;

    public function __construct()
    {
        $this->service = new DoadoraService(
            new DoadoraRepository(),
            new TriagemRepository(),
            new SorologiaRepository(),
            new FrascoLeiteCruRepository(),
            new FrascoPasteurizadoRepository()
        );
    }

    public function findAll(): void
    {
        Response::json($this->service->findAll());
    }

    public function findById(int $id): void
    {
        $doadora = $this->service->findById($id);

        if ($doadora === null) {
            Response::error("Doadora não encontrada.", 404);
            return;
        }

        Response::json($doadora);
    }

    public function create(): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $id = $this->service->create(new CreateDoadoraDTO($data));

            Response::json($this->service->findById($id), 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function update(int $id): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $this->service->update($id, new CreateDoadoraDTO($data));

            Response::json($this->service->findById($id));
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function triagem(int $id): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $this->service->registrarTriagem($id, new CreateTriagemDTO($data), AuthMiddleware::$funcionarioId);

            Response::json($this->service->findById($id), 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function sorologia(int $id): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $this->service->registrarSorologia($id, new CreateSorologiaDTO($data));

            Response::json($this->service->findById($id), 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function zonas(): void
    {
        Response::json($this->service->findZonas());
    }
}

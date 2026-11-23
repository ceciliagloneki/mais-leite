<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Controllers;

use MaisLeiteBackend\Dtos\ColetasDomiciliares\AgendarVisitaDTO;
use MaisLeiteBackend\Dtos\ColetasDomiciliares\CreateColetaDomiciliarDTO;
use MaisLeiteBackend\Dtos\ColetasDomiciliares\CreateFrascoLeiteCruDTO;
use MaisLeiteBackend\Dtos\ColetasDomiciliares\RealizarVisitaDTO;
use MaisLeiteBackend\Middlewares\AuthMiddleware;
use MaisLeiteBackend\Repositories\ColetaDomiciliarRepository;
use MaisLeiteBackend\Repositories\DoadoraRepository;
use MaisLeiteBackend\Repositories\FrascoLeiteCruRepository;
use MaisLeiteBackend\Services\ColetaDomiciliarService;
use MaisLeiteBackend\Utils\Response;
use InvalidArgumentException;

final class ColetaDomiciliarController
{
    private ColetaDomiciliarService $service;

    public function __construct()
    {
        $this->service = new ColetaDomiciliarService(
            new ColetaDomiciliarRepository(),
            new FrascoLeiteCruRepository(),
            new DoadoraRepository()
        );
    }

    public function findAll(): void
    {
        Response::json($this->service->findAll());
    }

    public function create(): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $id = $this->service->create(new CreateColetaDomiciliarDTO($data), AuthMiddleware::$funcionarioId);

            Response::json(['id' => $id], 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function agendar(): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $id = $this->service->agendar(new AgendarVisitaDTO($data), AuthMiddleware::$funcionarioId);

            Response::json(['id' => $id], 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function realizar(int $id): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $this->service->realizar($id, new RealizarVisitaDTO($data), AuthMiddleware::$funcionarioId);

            Response::json(['id' => $id]);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function cancelar(int $id): void
    {
        try {
            $this->service->cancelar($id);

            Response::json(['id' => $id]);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function frascos(): void
    {
        Response::json($this->service->findFrascos($_GET['status'] ?? null));
    }

    public function registrarFrasco(int $id): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $frascoId = $this->service->registrarFrasco($id, new CreateFrascoLeiteCruDTO($data));

            Response::json(['id' => $frascoId], 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}

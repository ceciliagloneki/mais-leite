<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Controllers;

use MaisLeiteBackend\Dtos\ColetasDomiciliares\ColetaDomiciliarListResponseDTO;
use MaisLeiteBackend\Dtos\ColetasDomiciliares\ColetaDomiciliarResponseDTO;
use MaisLeiteBackend\Dtos\ColetasDomiciliares\CreateColetaDomiciliarDTO;
use MaisLeiteBackend\Dtos\ColetasDomiciliares\UpdateColetaDomiciliarDTO;
use MaisLeiteBackend\Repositories\ColetaDomiciliarRepository;
use MaisLeiteBackend\Services\ColetaDomiciliarService;
use MaisLeiteBackend\Utils\Response;
use InvalidArgumentException;

final class ColetaDomiciliarController
{
    private ColetaDomiciliarService $service;

    public function __construct()
    {
        $this->service = new ColetaDomiciliarService(new ColetaDomiciliarRepository());
    }

    public function create(): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $dto = new CreateColetaDomiciliarDTO($data);
            $id = $this->service->create($dto);

            $coleta = $this->service->findById($id);
            Response::json(ColetaDomiciliarResponseDTO::fromArray($coleta), 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function findAll(): void
    {
        try {
            $status = $_GET['status'] ?? null;
            $coletas = $this->service->findAll($status);

            Response::json(ColetaDomiciliarListResponseDTO::fromArray($coletas));
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function findById(int $id): void
    {
        $coleta = $this->service->findById($id);

        if ($coleta === null) {
            Response::error("Coleta não encontrada.", 404);
            return;
        }

        Response::json(ColetaDomiciliarResponseDTO::fromArray($coleta));
    }

    public function update(int $id): void
    {
        try {
            $coleta = $this->service->findById($id);
            if ($coleta === null) {
                Response::error("Coleta não encontrada.", 404);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $dto = new UpdateColetaDomiciliarDTO($data);
            $this->service->update($id, $dto);

            $coleta = $this->service->findById($id);
            Response::json(ColetaDomiciliarResponseDTO::fromArray($coleta));
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function delete(int $id): void
    {
        try {
            $coleta = $this->service->findById($id);
            if ($coleta === null) {
                Response::error("Coleta não encontrada.", 404);
                return;
            }

            $this->service->delete($id);
            Response::json(['message' => 'Coleta cancelada com sucesso.']);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}

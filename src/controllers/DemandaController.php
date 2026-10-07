<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Controllers;

use MaisLeiteBackend\Dtos\Demandas\CreateDemandaDTO;
use MaisLeiteBackend\Dtos\Demandas\UpdateDemandaDTO;
use MaisLeiteBackend\Dtos\Demandas\DemandaListResponseDTO;
use MaisLeiteBackend\Dtos\Demandas\DemandaResponseDTO;
use MaisLeiteBackend\Repositories\DemandaRepository;
use MaisLeiteBackend\Services\DemandaService;
use MaisLeiteBackend\Utils\Response;
use InvalidArgumentException;

final class DemandaController
{
    private DemandaService $service;

    public function __construct() {
        $this->service = new DemandaService(new DemandaRepository());
    }

    public function create() : void {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $dto  = new CreateDemandaDTO($data);
            $id   = $this->service->create($dto);

            $demanda = $this->service->findById($id);
            Response::json(DemandaResponseDTO::fromArray($demanda), 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function findAll() : void {
        try {
            $status = $_GET['status_solicitacao'] ?? null;
            $demandas = $this->service->findAll($status);

            Response::json(DemandaListResponseDTO::fromArray($demandas));
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function update(int $id) : void {
        try {
            $demanda = $this->service->findById($id);
            if ($demanda === null) {
                Response::error("Demanda não encontrada!", 404);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $dto  = new UpdateDemandaDTO($data);
            $this->service->update($id, $dto);

            $demanda = $this->service->findById($id);
            Response::json(DemandaResponseDTO::fromArray($demanda));
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function delete(int $id) : void {
        try {
            $demanda = $this->service->findById($id);
            if($demanda === null) {
                Response::error("Demanda não encontrada!", 404);
                return;
            }

            $this->service->delete($id);
            Response::json(['message' => 'Demanda cancelada com sucesso!']);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
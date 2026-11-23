<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Controllers;

use MaisLeiteBackend\Dtos\Hospitais\CreateDemandaDTO;
use MaisLeiteBackend\Dtos\Hospitais\CreateHospitalDTO;
use MaisLeiteBackend\Dtos\Hospitais\CreatePrescricaoDTO;
use MaisLeiteBackend\Repositories\DemandaRepository;
use MaisLeiteBackend\Repositories\HospitalRepository;
use MaisLeiteBackend\Repositories\PrescricaoRepository;
use MaisLeiteBackend\Services\HospitalService;
use MaisLeiteBackend\Utils\Response;
use InvalidArgumentException;

final class HospitalController
{
    private HospitalService $service;

    public function __construct()
    {
        $this->service = new HospitalService(
            new HospitalRepository(),
            new DemandaRepository(),
            new PrescricaoRepository()
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
            $id = $this->service->create(new CreateHospitalDTO($data));

            Response::json(['id' => $id], 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function update(int $id): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $this->service->update($id, new CreateHospitalDTO($data));

            Response::json(['id' => $id]);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function demandas(): void
    {
        Response::json($this->service->findDemandas());
    }

    public function criarDemanda(): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $id = $this->service->createDemanda(new CreateDemandaDTO($data));

            Response::json(['id' => $id], 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function prescricoes(): void
    {
        Response::json($this->service->findPrescricoes());
    }

    public function criarPrescricao(int $id): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $prescricaoId = $this->service->createPrescricao($id, new CreatePrescricaoDTO($data));

            Response::json(['id' => $prescricaoId], 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}

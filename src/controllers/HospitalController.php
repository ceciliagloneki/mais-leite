<?php

declare(strict_types=1);

use MaisLeiteBackend\Dtos\Hospital\CreateHospitalDTO;
use MaisLeiteBackend\Dtos\Hospital\UpdateHospitalDTO;
use MaisLeiteBackend\Dtos\Hospital\HospitalResponseDTO;
use MaisLeiteBackend\Dtos\Hospital\HospitalListResponseDTO;
use MaisLeiteBackend\Repositories\HospitalRepository;
use MaisLeiteBackend\Services\HospitalService;
use MaisLeiteBackend\Models\Hospital;
use MaisLeiteBackend\Utils\Response;
use InvalidArgumentException;

final class HospitalController
{
    private HospitalService $service;

    public function __construct() {
        $this->service = new HospitalService(new HospitalRepository());
    }

    public function create() : void {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];

            $dto = new CreateHospitalDTO($data);

            $id = $this->service->create($dto);

            $hospital = $this->service->findById($id);

            Response::json(HospitalResponseDTO::fromArray($hospital), 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function findAll() : void {
        try {
            $status = $_GET['status'] ?? null;

            $hospital = $this->service->findAll($status);

            Response::json(HospitalListResponseDTO::fromArray($hospital));
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function findById(int $id) : void {
        $hospital = $this->service->findById($id);

        if ($hospital === null) {
            Response::error("Hospital não Encontrado!", 400);
            return;
        }

        Response::json(HospitalResponseDTO::fromArray($hospital));
    }

    public function update(int $id) : void {
        try {
            $hospital = $this->service->findById($id);

            if ($hospital === null) {
                Response::error("Hospital não encontrado!", 404);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true) ?? [];

            $dto = new UpdateHospitalDTO($data);

            $this->service->update($id, $dto);

            $hospital = $this->service->findById($id);

            Response::json(HospitalResponseDTO::fromArray($hospital));
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function delete(int $id) : void {
        try {
            $hospital = $this->service->findById($id);

            if ($hospital === null) {
                Response::error("Hospital não encontrado!", 404);
                return;
            }

            $this->service->delete($id);

            Response::json(['message' => 'Hospital inativado com sucesso!']);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Controllers;

use MaisLeiteBackend\Dtos\ControleFrascos\ControleFrascoListResponseDTO;
use MaisLeiteBackend\Dtos\ControleFrascos\ControleFrascoResponseDTO;
use MaisLeiteBackend\Dtos\ControleFrascos\CreateControleFrascoDTO;
use MaisLeiteBackend\Dtos\ControleFrascos\UpdateControleFrascoDTO;
use MaisLeiteBackend\Repositories\ControleFrascoRepository;
use MaisLeiteBackend\Services\ControleFrascoService;
use MaisLeiteBackend\Utils\Response;
use InvalidArgumentException;

final class ControleFrascoController
{
    private ControleFrascoService $service;

    public function __construct()
    {
        $this->service = new ControleFrascoService(new ControleFrascoRepository());
    }

    public function create(): void
    {
        try {
            $dto = new CreateControleFrascoDTO($this->readBody());
            $id = $this->service->create($dto);

            $controle = $this->service->findById($id);
            Response::json(ControleFrascoResponseDTO::fromArray($controle), 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function findAll(): void
    {
        try {
            $visitaColetaId = $_GET['visita_coleta_id'] ?? null;
            $controles = $this->service->findAll($visitaColetaId);

            Response::json(ControleFrascoListResponseDTO::fromArray($controles));
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function findById(int $id): void
    {
        $controle = $this->service->findById($id);

        if ($controle === null) {
            Response::error("Controle de frascos não encontrado.", 404);
            return;
        }

        Response::json(ControleFrascoResponseDTO::fromArray($controle));
    }

    public function update(int $id): void
    {
        try {
            $controle = $this->service->findById($id);
            if ($controle === null) {
                Response::error("Controle de frascos não encontrado.", 404);
                return;
            }

            $dto = new UpdateControleFrascoDTO($this->readBody());
            $this->service->update($id, $dto);

            $controle = $this->service->findById($id);
            Response::json(ControleFrascoResponseDTO::fromArray($controle));
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function delete(int $id): void
    {
        try {
            $controle = $this->service->findById($id);
            if ($controle === null) {
                Response::error("Controle de frascos não encontrado.", 404);
                return;
            }

            $this->service->delete($id);
            Response::json(['message' => 'Controle de frascos excluído com sucesso.']);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    private function readBody(): array
    {
        $data = json_decode(file_get_contents('php://input'), true);
        return is_array($data) ? $data : [];
    }
}

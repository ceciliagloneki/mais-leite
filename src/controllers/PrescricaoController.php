<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Controllers;

use InvalidArgumentException;
use MaisLeiteBackend\Dtos\Prescricoes\CreatePrescricaoDTO;
use MaisLeiteBackend\Dtos\Prescricoes\PrescricaoListResponseDTO;
use MaisLeiteBackend\Dtos\Prescricoes\PrescricaoResponseDTO;
use MaisLeiteBackend\Dtos\Prescricoes\UpdatePrescricaoDTO;
use MaisLeiteBackend\Repositories\PrescricaoRepository;
use MaisLeiteBackend\Services\PrescricaoService;
use MaisLeiteBackend\Utils\Response;

final class PrescricaoController
{
    private PrescricaoService $service;

    public function __construct() {
        $this->service = new PrescricaoService(new PrescricaoRepository());
    }

    public function create() : void {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $dto  = new CreatePrescricaoDTO($data);
            $id   = $this->service->create($dto);

            $prescricao = $this->service->findById($id);
            Response::json(PrescricaoResponseDTO::fromArray($prescricao), 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function findAll() : void {
        try {
            $demanda    = $_GET['demanda_id'] ?? null;
            $tipo_leite = $_GET['tipo_leite'] ?? null;
            
            $prescricoes = $this->service->findAll($demanda, $tipo_leite);

            Response::json(PrescricaoListResponseDTO::fromArray($prescricoes));
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function findById(int $id) : void {
        $prescricao = $this->service->findById($id);

        if ($prescricao === null) {
            Response::error('Prescrição não encontrada!', 404);
            return;
        }

        Response::json(PrescricaoResponseDTO::fromArray($prescricao));
    }

    public function update(int $id) : void {
        try {
            $prescricao = $this->service->findById($id);
            
            if ($prescricao === null) {
                Response::error("Prescrição não encontrada!", 404);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $dto  = new UpdatePrescricaoDTO($data);
            $this->service->update($id, $dto);

            $prescricao = $this->service->findById($id);
            Response::json(PrescricaoResponseDTO::fromArray($prescricao));
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function delete(int $id) : void {
        try {
            $prescricao = $this->service->findById($id);

            if ($prescricao === null) {
                Response::error("Prescrição não encontrada!", 404);
                return;
            }

            $this->service->delete($id);
            Response::json(['message' => 'Prescrição deletada com sucesso!']);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
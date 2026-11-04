<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Controllers;

use InvalidArgumentException;
use MaisLeiteBackend\Dtos\Distribuicoes\CreateDistribuicaoDTO;
use MaisLeiteBackend\Dtos\Distribuicoes\DistribuicaoListResponseDTO;
use MaisLeiteBackend\Dtos\Distribuicoes\DistribuicaoResponseDTO;
use MaisLeiteBackend\Dtos\Distribuicoes\UpdateDistribuicaoDTO;
use MaisLeiteBackend\Repositories\DistribuicaoRepository;
use MaisLeiteBackend\Services\DistribuicaoService;
use MaisLeiteBackend\Utils\Response;

final class DistribuicaoController
{
    private DistribuicaoService $service;

    public function __construct () {
        $this->service = new DistribuicaoService(new DistribuicaoRepository());
    }

    public function create () : void {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $dto  = new CreateDistribuicaoDTO($data);
            $id   = $this->service->create($dto);

            $distribuicao = $this->service->findById($id);
            Response::json(DistribuicaoResponseDTO::fromArray($distribuicao), 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function findAll() : void {
        try {
            $demanda = isset($_GET['demanda_id']) && ctype_digit((string) $_GET['demanda_id']) ? (int) $_GET['demanda_id'] : null;
            $data    = $_GET['data'] ?? null;

            $distribuicoes = $this->service->findAll($demanda, $data);

            Response::json(DistribuicaoListResponseDTO::fromArray($distribuicoes));
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function findById (int $id) : void {
        $distribuicao = $this->service->findById($id);

        if ($distribuicao === null) {
            Response::error("Distribuição não encontrada!", 404);
            return;
        }

        Response::json(DistribuicaoResponseDTO::fromArray($distribuicao));
    }

    public function update (int $id) : void {
        try {
            $distribuicao = $this->service->findById($id);

            if ($distribuicao === null) {
                Response::error("Distribuição não encontrada!", 404);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $dto  = new UpdateDistribuicaoDTO($data);
            $this->service->update($id, $dto);

            $distribuicao = $this->service->findById($id);
            Response::json(DistribuicaoResponseDTO::fromArray($distribuicao));
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function delete (int $id) : void {
        try {
            $distribuicao = $this->service->findById($id);

            if ($distribuicao === null) {
                Response::error("Distribuição não encontrada!", 404);
                return;
            }

            $this->service->delete($id);
            Response::json(['message' => 'Distribuição deletada com sucesso!']);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
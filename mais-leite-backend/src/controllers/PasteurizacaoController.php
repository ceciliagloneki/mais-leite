<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Controllers;

use MaisLeiteBackend\Dtos\Pasteurizacoes\CreateAnaliseFisicoQuimicaDTO;
use MaisLeiteBackend\Dtos\Pasteurizacoes\CreateFrascoPasteurizadoDTO;
use MaisLeiteBackend\Dtos\Pasteurizacoes\CreatePasteurizacaoDTO;
use MaisLeiteBackend\Middlewares\AuthMiddleware;
use MaisLeiteBackend\Repositories\AnaliseFisicoQuimicaRepository;
use MaisLeiteBackend\Repositories\FrascoLeiteCruRepository;
use MaisLeiteBackend\Repositories\FrascoPasteurizadoRepository;
use MaisLeiteBackend\Repositories\PasteurizacaoRepository;
use MaisLeiteBackend\Services\PasteurizacaoService;
use MaisLeiteBackend\Utils\Response;
use InvalidArgumentException;

final class PasteurizacaoController
{
    private PasteurizacaoService $service;

    public function __construct()
    {
        $this->service = new PasteurizacaoService(
            new PasteurizacaoRepository(),
            new FrascoLeiteCruRepository(),
            new FrascoPasteurizadoRepository(),
            new AnaliseFisicoQuimicaRepository()
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
            $id = $this->service->create(new CreatePasteurizacaoDTO($data), AuthMiddleware::$funcionarioId);

            Response::json(['id' => $id], 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function reenvasar(int $id): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $frascoId = $this->service->reenvasar($id, new CreateFrascoPasteurizadoDTO($data));

            Response::json(['id' => $frascoId], 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function frascos(): void
    {
        Response::json($this->service->findFrascos($_GET['status'] ?? null));
    }

    public function analisar(int $id): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $aprovado = $this->service->analisar($id, new CreateAnaliseFisicoQuimicaDTO($data));

            Response::json(['aprovado' => $aprovado], 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}

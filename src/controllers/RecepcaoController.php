<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Controllers;

use MaisLeiteBackend\Dtos\Recepcoes\CreateRecepcaoDTO;
use MaisLeiteBackend\Middlewares\AuthMiddleware;
use MaisLeiteBackend\Repositories\FrascoLeiteCruRepository;
use MaisLeiteBackend\Repositories\RecepcaoRepository;
use MaisLeiteBackend\Services\RecepcaoService;
use MaisLeiteBackend\Utils\Response;
use InvalidArgumentException;

final class RecepcaoController
{
    private RecepcaoService $service;

    public function __construct()
    {
        $this->service = new RecepcaoService(new RecepcaoRepository(), new FrascoLeiteCruRepository());
    }

    public function findAll(): void
    {
        Response::json($this->service->findAll());
    }

    public function create(): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $id = $this->service->create(new CreateRecepcaoDTO($data), AuthMiddleware::$funcionarioId);

            Response::json(['id' => $id], 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}

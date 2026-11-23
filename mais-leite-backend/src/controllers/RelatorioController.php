<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Controllers;

use MaisLeiteBackend\Repositories\RelatorioRepository;
use MaisLeiteBackend\Services\RelatorioService;
use MaisLeiteBackend\Utils\Response;

final class RelatorioController
{
    private RelatorioService $service;

    public function __construct()
    {
        $this->service = new RelatorioService(new RelatorioRepository());
    }

    public function dashboard(): void
    {
        Response::json($this->service->dashboard());
    }

    public function rastreabilidade(int $id): void
    {
        $resultado = $this->service->rastreabilidade($id);

        if ($resultado === null) {
            Response::error("Frasco pasteurizado não encontrado.", 404);
            return;
        }

        Response::json($resultado);
    }
}

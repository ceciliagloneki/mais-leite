<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Controllers;

use MaisLeiteBackend\Dtos\Auth\LoginDTO;
use MaisLeiteBackend\Repositories\FuncionarioRepository;
use MaisLeiteBackend\Services\AuthService;
use MaisLeiteBackend\Utils\Response;
use InvalidArgumentException;

final class AuthController
{
    private AuthService $service;

    public function __construct()
    {
        $this->service = new AuthService(new FuncionarioRepository());
    }

    public function login(): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];

            $dto = new LoginDTO($data);

            $resultado = $this->service->login($dto);

            Response::json($resultado);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 401);
        }
    }
}

<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Controllers;

use InvalidArgumentException;
use MaisLeiteBackend\Dtos\Auth\LoginDTO;
use MaisLeiteBackend\Repositories\FuncionarioRepository;
use MaisLeiteBackend\Services\AuthService;
use MaisLeiteBackend\Utils\Response;
use RuntimeException;

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
            $data = json_decode(file_get_contents('php://input'), true);
            if (!is_array($data)) {
                throw new InvalidArgumentException('Envie os dados do login em formato JSON.');
            }
            Response::json($this->service->login(new LoginDTO($data)));
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        } catch (RuntimeException $e) {
            Response::error($e->getMessage(), $e->getCode() ?: 401);
        }
    }
}

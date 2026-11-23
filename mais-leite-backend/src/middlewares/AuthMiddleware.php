<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Middlewares;

use MaisLeiteBackend\Enums\StatusEnum;
use MaisLeiteBackend\Repositories\FuncionarioRepository;
use MaisLeiteBackend\Services\AuthService;
use MaisLeiteBackend\Utils\Response;

final class AuthMiddleware
{
    public static ?int $funcionarioId = null;

    public function handle(): bool
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
            Response::error('Autenticação obrigatória.', 401);
            return false;
        }

        $payload = (new AuthService())->validateToken($matches[1]);
        if ($payload === null) {
            Response::error('Token inválido ou expirado.', 401);
            return false;
        }

        $repository = new FuncionarioRepository();
        $funcionario = $repository->findById((int) $payload['sub']);
        if ($funcionario === null || $funcionario['email'] !== $payload['email'] || $funcionario['status'] !== StatusEnum::ATIVO->value) {
            Response::error('Autenticação inválida.', 401);
            return false;
        }

        self::$funcionarioId = (int) $funcionario['id'];

        return true;
    }
}

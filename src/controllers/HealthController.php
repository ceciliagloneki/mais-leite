<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Controllers;

use MaisLeiteBackend\Utils\Response;

/**
 * Controller de exemplo para verificar se a API está no ar.
 */
final class HealthController
{
    public function index(): void
    {
        Response::json([
            'status' => 'ok',
            'message' => 'API Mais Leite no ar.',
        ]);
    }
}

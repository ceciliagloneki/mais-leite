<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Controllers;

use MaisLeiteBackend\Utils\Response;

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

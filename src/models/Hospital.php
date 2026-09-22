<?php

declare(strict_types=1);
namespace MaisLeiteBackend\Models;

class Hospital
{
    public int    $id;
    public string $nome;
    public ?string $telefone;
    public string $status;
}


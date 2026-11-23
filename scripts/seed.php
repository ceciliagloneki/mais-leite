<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';
Dotenv\Dotenv::createImmutable(__DIR__ . '/..')->safeLoad();

use MaisLeiteBackend\Dtos\Funcionarios\CreateFuncionarioDTO;
use MaisLeiteBackend\Models\Hospital;
use MaisLeiteBackend\Repositories\FuncionarioRepository;
use MaisLeiteBackend\Repositories\HospitalRepository;
use MaisLeiteBackend\Services\FuncionarioService;

$email = 'admin@maisleite.local';
$senha = 'MaisLeite@123';

try {
    $funcionarios = new FuncionarioRepository();
    if ($funcionarios->findByEmail($email) === null) {
        (new FuncionarioService($funcionarios))->create(new CreateFuncionarioDTO([
            'nome' => 'Administrador',
            'cargo' => 'Administrador',
            'email' => $email,
            'senha' => $senha,
        ]));
        echo "Administrador criado: {$email} / {$senha}\n";
    } else {
        echo "Administrador já existe: {$email}\n";
    }

    $hospitais = new HospitalRepository();
    foreach (['Hospital Exemplo A', 'Hospital Exemplo B'] as $nome) {
        if ($hospitais->findByNome($nome) === null) {
            $hospitais->create(new Hospital(id: null, nome: $nome, telefone: null));
        }
    }
    echo "Hospitais de exemplo disponíveis.\n";
} catch (Throwable $e) {
    fwrite(STDERR, "Falha no seed: " . $e->getMessage() . "\nExecute composer migrate antes.\n");
    exit(1);
}

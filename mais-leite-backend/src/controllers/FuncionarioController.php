<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Controllers;

use MaisLeiteBackend\Dtos\Funcionarios\CreateFuncionarioDTO;
use MaisLeiteBackend\Dtos\Funcionarios\UpdateFuncionarioDTO;
use MaisLeiteBackend\Dtos\Funcionarios\FuncionarioResponseDTO;
use MaisLeiteBackend\Dtos\Funcionarios\FuncionarioListResponseDTO;
use MaisLeiteBackend\Repositories\FuncionarioRepository;
use MaisLeiteBackend\Services\FuncionarioService;
use MaisLeiteBackend\Utils\Response;
use InvalidArgumentException;

final class FuncionarioController
{
    private FuncionarioService $service;

    public function __construct()
    {
        $this->service = new FuncionarioService(new FuncionarioRepository());
    }

    public function create(): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];

            $dto = new CreateFuncionarioDTO($data);

            $id = $this->service->create($dto);

            $funcionario = $this->service->findById($id);

            Response::json(FuncionarioResponseDTO::fromArray($funcionario), 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function findAll(): void
    {
        try {
            $status = $_GET['status'] ?? null;

            $funcionarios = $this->service->findAll($status);

            Response::json(FuncionarioListResponseDTO::fromArray($funcionarios));
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function findById(int $id): void
    {
        $funcionario = $this->service->findById($id);

        if ($funcionario === null) {
            Response::error("Funcionário não encontrado.", 404);
            return;
        }

        Response::json(FuncionarioResponseDTO::fromArray($funcionario));
    }

    public function update(int $id): void
    {
        try {
            $funcionario = $this->service->findById($id);

            if ($funcionario === null) {
                Response::error("Funcionário não encontrado.", 404);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true) ?? [];

            $dto = new UpdateFuncionarioDTO($data);

            $this->service->update($id, $dto);

            $funcionario = $this->service->findById($id);

            Response::json(FuncionarioResponseDTO::fromArray($funcionario));
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function delete(int $id): void
    {
        try {
            $funcionario = $this->service->findById($id);

            if ($funcionario === null) {
                Response::error("Funcionário não encontrado.", 404);
                return;
            }

            $this->service->delete($id);

            Response::json(['message' => 'Funcionário inativado com sucesso.']);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}

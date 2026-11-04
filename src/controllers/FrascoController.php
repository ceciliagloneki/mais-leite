<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Controllers;

use MaisLeiteBackend\Dtos\Frascos\CreateFrascoDTO;
use MaisLeiteBackend\Dtos\Frascos\FrascoListResponseDTO;
use MaisLeiteBackend\Dtos\Frascos\FrascoResponseDTO;
use MaisLeiteBackend\Dtos\Frascos\UpdateFrascoDTO;
use MaisLeiteBackend\Repositories\FrascoRepository;
use MaisLeiteBackend\Services\FrascoService;
use MaisLeiteBackend\Utils\Response;
use DomainException;
use InvalidArgumentException;

final class FrascoController
{
    private FrascoService $service;

    public function __construct()
    {
        $this->service = new FrascoService(new FrascoRepository());
    }

    public function create(): void
    {
        try {
            $dto = new CreateFrascoDTO($this->readBody());
            $id = $this->service->create($dto);

            $frasco = $this->service->findById($id);
            Response::json(FrascoResponseDTO::fromArray($frasco), 201);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        } catch (DomainException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    public function findAll(): void
    {
        try {
            $tipoFrasco = $this->readQueryString('tipo_frasco');
            $estado = $this->readQueryString('estado');
            $frascos = $this->service->findAll($tipoFrasco, $estado);

            Response::json(FrascoListResponseDTO::fromArray($frascos));
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function findById(int $id): void
    {
        $frasco = $this->service->findById($id);

        if ($frasco === null) {
            Response::error("Frasco não encontrado.", 404);
            return;
        }

        Response::json(FrascoResponseDTO::fromArray($frasco));
    }

    public function update(int $id): void
    {
        try {
            $frasco = $this->service->findById($id);
            if ($frasco === null) {
                Response::error("Frasco não encontrado.", 404);
                return;
            }

            $dto = new UpdateFrascoDTO($this->readBody());
            $this->service->update($id, $dto);

            $frasco = $this->service->findById($id);
            Response::json(FrascoResponseDTO::fromArray($frasco));
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        } catch (DomainException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    public function delete(int $id): void
    {
        try {
            $frasco = $this->service->findById($id);
            if ($frasco === null) {
                Response::error("Frasco não encontrado.", 404);
                return;
            }

            $this->service->delete($id);
            Response::json(['message' => 'Frasco excluído com sucesso.']);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        } catch (DomainException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    private function readBody(): array
    {
        $data = json_decode(file_get_contents('php://input'), true);
        return is_array($data) ? $data : [];
    }

    private function readQueryString(string $key): ?string
    {
        if (!isset($_GET[$key])) {
            return null;
        }
        if (!is_string($_GET[$key])) {
            throw new InvalidArgumentException("Filtro '{$key}' inválido.");
        }
        return $_GET[$key];
    }
}

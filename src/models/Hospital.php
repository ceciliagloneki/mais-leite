<?php

declare(strict_types=1);
namespace MaisLeiteBackend\Models;

class Hospital
{
    public function __construct(
        private ?int    $id,
        private string  $nome,
        private ?string $telefone,
        private string  $status
    ) {
        $this->id       = $id;
        $this->nome     = $nome;
        $this->telefone = $telefone;
        $this->status   = $status;
    }

    // GETs
    public function getId() : ?int {
        return $this->id;
    }

    public function getNome() : string {
        return $this->nome;
    }

    public function getTelefone() : ?string {
        return $this->telefone;
    }

    public function getStatus() : string {
        return $this->status;
    }

    // SETs
    public function setNome(string $nome) : void {
        $this->nome = $nome;
    }
    public function setTelefone(string $telefone) : void {
        $this->telefone = $telefone;
    }
    public function setStatus(string $status) : void {
        $this->status = $status;
    }
}


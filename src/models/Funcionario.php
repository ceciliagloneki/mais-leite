<?php

namespace MaisLeiteBackend\Models;

class Funcionario
{
    private ?int $id;
    private string $nome;
    private string $cargo;
    private string $email;
    private string $senha;
    private string $status;

    public function __construct(
        ?int $id,
        string $nome,
        string $cargo,
        string $email,
        string $senha,
        string $status
    ) {
        $this->id = $id;
        $this->nome = $nome;
        $this->cargo = $cargo;
        $this->email = $email;
        $this->senha = $senha;
        $this->status = $status;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNome(): string
    {
        return $this->nome;
    }

    public function getCargo(): string
    {
        return $this->cargo;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getSenha(): string
    {
        return $this->senha;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setNome(string $nome): void
    {
        $this->nome = $nome;
    }

    public function setCargo(string $cargo): void
    {
        $this->cargo = $cargo;
    }

    public function setEmail(string $email): void
    {
        $this->email = $email;
    }

    public function setSenha(string $senha): void
    {
        $this->senha = $senha;
    }

    public function setStatus(string $status): void
    {
        $this->status = $status;
    }
}
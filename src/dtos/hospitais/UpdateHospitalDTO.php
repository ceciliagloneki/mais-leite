<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Hospital;
use InvalidArgumentException;

class UpdateHospitalDTO
{
    public readonly ?string $nome;
    public readonly ?string $telefone;

    public function __construct(array $data) {
        $this->validateAllowedFields($data);
        
        $this->nome     = isset($data['nome']) ? $this->validateNome($data['nome']) : null;
        $this->telefone = isset($data['telefone']) ? $this->validateTelefone($data['telefone']) : null;
    }

    private function validateAllowedFields(array $data) : void {
        $notAllowed = ['id', 'status'];

        foreach ($notAllowed as $field) {
            if (isset($data[$field]))
                throw new InvalidArgumentException("Campo '{$field}' não pode ser alterado!");
        }

        if (empty($data))
            throw new InvalidArgumentException("Nenhum campo para atualizar!");
        
    }

    private function validateNome(string $nome) : string {
        $nome = trim($nome);

        if ($nome === '')
            throw new InvalidArgumentException("Campo 'Nome' é obrigatório!");

        return $nome;
    }

    private function validateTelefone(?string $telefone) : ?string {
        if ($telefone === null || trim($telefone) === '')
            return null;

        $regex = '/^(?:\+?55[\s.-]?)?(?:\([1-9]\d\)|[1-9]\d)[\s.-]?(?:9\d{4}[\s.-]?\d{4}|[2-5]\d{3}[\s.-]?\d{4})$/';

        if (!preg_match($regex, $telefone))
            throw new InvalidArgumentException("Telefone inválido!");
    
        return $telefone;
    }

    public function toArray() : array {
        $data = [];

        if ($this->nome !== null)
            $data['nome'] = $this->nome;

        if ($this->telefone !== null)
            $data['telefone'] = $this->telefone;

        return $data;
    }
}
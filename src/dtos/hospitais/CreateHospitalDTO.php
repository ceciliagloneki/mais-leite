<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Hospital;
use InvalidArgumentException;

final class CreateFuncionarioDTO
{
    public readonly string  $nome;
    public readonly ?string $telefone;
    
    public function __construct(array $data) {
        $this->validateRequired($data);

        $this->nome     = $this->validateNome($data['nome']);
        $this->telefone = $this->validateTelefone($data['telefone'] ?? null);
    }

    private function validateRequired(array $data) : void {
        $required = ['nome'];

        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '')
                throw new InvalidArgumentException("Campo '{$field}' é obrigatório!");

        }
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
}

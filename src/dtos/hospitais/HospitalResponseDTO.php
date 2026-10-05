<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Dtos\Hospital;

final class HospitalResponseDTO
{
    public static function fromArray(array $data) : array {
        return [
            'id'       => (int) $data['id'],
            'nome'     => $data['nome'],
            'telefone' => $data['telefone'],
            'status'   => $data['status']
        ];
    }
}
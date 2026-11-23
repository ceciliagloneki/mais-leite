<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Repositories;

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Models\Doadora;
use PDO;

final class DoadoraRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(Doadora $doadora): int
    {
        $sql = "INSERT INTO doadora (zona_id, nome, data_nasc, cartao_sus, telefone,
                    endereco_rua, endereco_numero, endereco_bairro, nome_bebe, data_parto,
                    vacina_febre_amarela, vacina_dtpa, transfusao_sangue, data_transfusao, tatuagem, data_tatuagem,
                    fumante, cigarros_dia, consome_alcool, uso_medicacao)
                VALUES (:zona_id, :nome, :data_nasc, :cartao_sus, :telefone,
                    :endereco_rua, :endereco_numero, :endereco_bairro, :nome_bebe, :data_parto,
                    :vacina_febre_amarela, :vacina_dtpa, :transfusao_sangue, :data_transfusao, :tatuagem, :data_tatuagem,
                    :fumante, :cigarros_dia, :consome_alcool, :uso_medicacao)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($this->params($doadora));

        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, Doadora $doadora): bool
    {
        $sql = "UPDATE doadora SET zona_id = :zona_id, nome = :nome, data_nasc = :data_nasc, cartao_sus = :cartao_sus,
                    telefone = :telefone, endereco_rua = :endereco_rua,
                    endereco_numero = :endereco_numero, endereco_bairro = :endereco_bairro, nome_bebe = :nome_bebe, data_parto = :data_parto,
                    vacina_febre_amarela = :vacina_febre_amarela, vacina_dtpa = :vacina_dtpa,
                    transfusao_sangue = :transfusao_sangue, data_transfusao = :data_transfusao,
                    tatuagem = :tatuagem, data_tatuagem = :data_tatuagem, fumante = :fumante,
                    cigarros_dia = :cigarros_dia, consome_alcool = :consome_alcool,
                    uso_medicacao = :uso_medicacao
                WHERE id = :id";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute($this->params($doadora) + ['id' => $id]);
    }

    public function updateStatus(int $id, string $status): bool
    {
        $stmt = $this->db->prepare("UPDATE doadora SET status = :status WHERE id = :id");

        return $stmt->execute(['id' => $id, 'status' => $status]);
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT d.*, z.nome AS zona_nome, z.dia_da_semana
                FROM doadora d
                INNER JOIN zona z ON z.id = d.zona_id
                WHERE d.id = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);

        $result = $stmt->fetch();

        return $result ?: null;
    }

    public function findByCartaoSus(string $cartaoSus): ?array
    {
        $stmt = $this->db->prepare("SELECT id FROM doadora WHERE cartao_sus = :cartao_sus");
        $stmt->execute(['cartao_sus' => $cartaoSus]);

        $result = $stmt->fetch();

        return $result ?: null;
    }

    public function findAll(): array
    {
        $sql = "SELECT d.id, d.nome, d.cartao_sus, d.telefone, d.data_cad, d.data_nasc, d.status,
                       d.zona_id, z.nome AS zona_nome, z.dia_da_semana
                FROM doadora d
                INNER JOIN zona z ON z.id = d.zona_id
                ORDER BY d.nome ASC";

        return $this->db->query($sql)->fetchAll();
    }

    public function findZonas(): array
    {
        return $this->db->query("SELECT id, dia_da_semana, nome FROM zona ORDER BY id")->fetchAll();
    }

    public function zonaExists(int $id): bool
    {
        $stmt = $this->db->prepare("SELECT id FROM zona WHERE id = :id");
        $stmt->execute(['id' => $id]);

        return $stmt->fetch() !== false;
    }

    private function params(Doadora $doadora): array
    {
        return [
            'zona_id' => $doadora->zonaId,
            'nome' => $doadora->nome,
            'data_nasc' => $doadora->dataNasc,
            'cartao_sus' => $doadora->cartaoSus,
            'telefone' => $doadora->telefone,
            'endereco_rua' => $doadora->enderecoRua,
            'endereco_numero' => $doadora->enderecoNumero,
            'endereco_bairro' => $doadora->enderecoBairro,
            'nome_bebe' => $doadora->nomeBebe,
            'data_parto' => $doadora->dataParto,
            'vacina_febre_amarela' => (int) $doadora->vacinaFebreAmarela,
            'vacina_dtpa' => (int) $doadora->vacinaDtpa,
            'transfusao_sangue' => (int) $doadora->transfusaoSangue,
            'data_transfusao' => $doadora->dataTransfusao,
            'tatuagem' => (int) $doadora->tatuagem,
            'data_tatuagem' => $doadora->dataTatuagem,
            'fumante' => (int) $doadora->fumante,
            'cigarros_dia' => $doadora->cigarrosDia,
            'consome_alcool' => (int) $doadora->consomeAlcool,
            'uso_medicacao' => $doadora->usoMedicacao,
        ];
    }
}

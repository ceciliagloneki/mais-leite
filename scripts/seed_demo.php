<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';
Dotenv\Dotenv::createImmutable(__DIR__ . '/..')->safeLoad();

use MaisLeiteBackend\Database\Database;
use MaisLeiteBackend\Enums\TipoLeiteEnum;

$argumento = $argv[1] ?? '2026-11-26';
$base = new DateTimeImmutable($argumento === 'hoje' ? 'today' : $argumento);
$segunda = $base->modify('monday this week');

$zonaDia = fn (int $zona, int $semana): string => $segunda->modify(sprintf('%+d days', ($zona - 1) + 7 * $semana))->format('Y-m-d');
$dia = fn (int $deslocamento): string => $base->modify(sprintf('%+d days', $deslocamento))->format('Y-m-d');
$somar = fn (string $data, int $dias): string => (new DateTimeImmutable($data))->modify(sprintf('%+d days', $dias))->format('Y-m-d');

try {
    $pdo = Database::getConnection();

    $tabelas = [
        'devolucao_frascos', 'frasco_distribuicao', 'distribuicao', 'prescricao', 'demanda',
        'analise_fisico_quimica', 'frasco_pasteurizado', 'pasteurizacao', 'frasco_leite_cru',
        'recepcao', 'visita_coleta', 'sorologia', 'triagem', 'doadora', 'hospital', 'funcionario',
    ];
    $pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
    foreach ($tabelas as $t) {
        $pdo->exec("TRUNCATE TABLE {$t}");
    }
    $pdo->exec('SET FOREIGN_KEY_CHECKS = 1');

    $pdo->exec(
        "INSERT IGNORE INTO zona (id, dia_da_semana, nome) VALUES " .
        "(1,'segunda','Zona Norte'),(2,'terca','Zona Sul'),(3,'quarta','Zona Oeste')," .
        "(4,'quinta','Zona Leste'),(5,'sexta','Zona Rural e Maracá')"
    );

    $ins = function (string $sql, array $params) use ($pdo): int {
        $pdo->prepare($sql)->execute($params);
        return (int) $pdo->lastInsertId();
    };
    $exec = fn (string $sql, array $params) => $pdo->prepare($sql)->execute($params);

    $senha = password_hash('MaisLeite@123', PASSWORD_BCRYPT);
    $sqlFunc = "INSERT INTO funcionario (nome, cargo, email, senha, status) VALUES (?,?,?,?,?)";
    $admin = $ins($sqlFunc, ['Administrador', 'Administrador', 'admin@maisleite.local', $senha, 'ativo']);
    $farm = $ins($sqlFunc, ['Carlos Neto', 'Farmacêutico Responsável Técnico', 'farmaceutico@blhmarilia.sp.gov.br', $senha, 'ativo']);
    $enf = $ins($sqlFunc, ['Marina Alves', 'Enfermeira', 'enfermeira@blhmarilia.sp.gov.br', $senha, 'ativo']);
    $tec = $ins($sqlFunc, ['Roberto Lima', 'Técnico de Enfermagem', 'tecnico@blhmarilia.sp.gov.br', $senha, 'ativo']);
    $ins($sqlFunc, ['Sueli Prado', 'Auxiliar de Laboratório', 'sueli.prado@blhmarilia.sp.gov.br', $senha, 'inativo']);

    $sqlDo = "INSERT INTO doadora
      (zona_id, data_cad, nome, data_nasc, cartao_sus, telefone, endereco_rua, endereco_numero, endereco_bairro, nome_bebe, data_parto,
       vacina_febre_amarela, vacina_dtpa, transfusao_sangue, data_transfusao, tatuagem, data_tatuagem,
       fumante, cigarros_dia, consome_alcool, uso_medicacao, orientacao_tecnica, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

    $partos = [];
    $zonaDe = [];
    $doadora = function (int $zona, string $cadastro, string $nome, string $nasc, string $sus, string $tel, string $rua, string $num, string $bairro, string $bebe, string $parto, string $status, array $extras = [])
        use ($ins, $sqlDo, &$partos, &$zonaDe): int {
        $e = $extras + ['tatuagem' => 0, 'data_tatuagem' => null, 'fumante' => 0, 'cigarros' => null, 'alcool' => 0, 'medicacao' => null, 'dtpa' => 1];
        $id = $ins($sqlDo, [
            $zona, "{$cadastro} 09:00:00", $nome, $nasc, $sus, $tel, $rua, $num, $bairro, $bebe, $parto,
            1, $e['dtpa'], 0, null, $e['tatuagem'], $e['data_tatuagem'], $e['fumante'], $e['cigarros'], $e['alcool'], $e['medicacao'], 1, $status,
        ]);
        $partos[$id] = $parto;
        $zonaDe[$id] = $zona;
        return $id;
    };

    $partoLarissa = $somar($zonaDia(1, -2), -3);
    $partoMariana = $somar($zonaDia(2, -1), -4);

    $ana = $doadora(1, $dia(-190), 'Ana Clara Ferreira', '1994-03-12', '700000000000001', '(14) 98765-4321', 'Rua das Acácias', '245', 'Jardim Europa', 'Miguel Ferreira', $dia(-120), 'ativa');
    $larissa = $doadora(1, $somar($partoLarissa, 1), 'Larissa Gomes Pereira', '1997-07-21', '700000000000007', '(14) 99123-4567', 'Rua Coronel Galdino', '1020', 'Fragata', 'Helena Gomes', $partoLarissa, 'ativa');
    $camila = $doadora(1, $dia(-13), 'Camila Duarte Ramos', '2000-02-14', '700000000000008', '(14) 98111-2233', 'Rua Vicente Ferreira', '88', 'Palmital', 'Davi Duarte', $dia(-25), 'em_triagem');
    $juliana = $doadora(2, $dia(-210), 'Juliana Mendes Costa', '1990-08-02', '700000000000002', '(14) 97654-3210', 'Av. Brasil', '1100, Apto 32', 'Centro', 'Laura Mendes', $dia(-150), 'ativa');
    $mariana = $doadora(2, $somar($partoMariana, 1), 'Mariana Ribeiro Alves', '1995-10-05', '700000000000009', '(14) 99777-8899', 'Rua Bahia', '410', 'Cascata', 'Theo Ribeiro', $partoMariana, 'ativa');
    $patricia = $doadora(3, $dia(-12), 'Patricia Souza Lima', '1998-05-09', '700000000000005', '(14) 96543-2109', 'Rua Goiás', '12', 'Vila Nova', 'Alice Souza', $dia(-40), 'em_triagem', ['dtpa' => 0]);
    $debora = $doadora(3, $dia(-75), 'Débora Martins Silva', '1993-04-27', '700000000000010', '(14) 98444-5566', 'Rua Prudente de Moraes', '75', 'Jardim Cavallari', 'Bernardo Martins', $dia(-60), 'ativa');
    $beatriz = $doadora(4, $dia(-70), 'Beatriz Almeida Nunes', '1992-01-30', '700000000000004', '(14) 99988-7766', 'Rua Minas Gerais', '50', 'Jardim Aurora', 'Sofia Almeida', $dia(-67), 'ativa');
    $tatiane = $doadora(4, $dia(-33), 'Tatiane Moura Lopes', '1999-09-09', '700000000000011', '(14) 98222-3344', 'Rua São Luiz', '301', 'Jardim Maria Izabel', 'Arthur Moura', $dia(-35), 'ativa', ['tatuagem' => 1, 'data_tatuagem' => '2021-06']);
    $renata = $doadora(4, $dia(-90), 'Renata Oliveira Santos', '1989-12-17', '700000000000006', '(14) 95432-1098', 'Rua Bahia', '77', 'Jardim Sol', 'Pedro Oliveira', $dia(-110), 'inapta', ['fumante' => 1, 'cigarros' => 10, 'alcool' => 1, 'medicacao' => 'Uso contínuo de medicação contraindicada']);
    $gabriela = $doadora(4, $dia(-80), 'Gabriela Freitas Moreira', '1991-11-03', '700000000000012', '(14) 99666-1122', 'Av. Sampaio Vidal', '900', 'Centro', 'Lucas Freitas', $dia(-95), 'removida');
    $fernanda = $doadora(5, $dia(-150), 'Fernanda Castro Rocha', '1996-11-23', '700000000000003', '(14) 94321-0987', 'Estrada Municipal', 'km 4', 'Distrito de Padre Nóbrega', 'Valentina Castro', $dia(-100), 'ativa');
    $vanessa = $doadora(5, $dia(-50), 'Vanessa Lopes Teixeira', '1994-06-18', '700000000000013', '(14) 98999-0011', 'Rua Principal', '15', 'Distrito de Amadeu Amaral', 'Gael Lopes', $dia(-45), 'ativa');

    $sqlTri = "INSERT INTO triagem
      (doadora_id, funcionario_id, data_triagem, agua_potavel, esgoto, renda, infeccao_urinaria,
       hipertensao, diabetes, hepatite, apgar_bebe, peso_bebe, malformacao_bebe,
       equipamento_estocagem, produtos_junto_leite, conforme)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    $triagem = fn (int $d, string $data, string $equip, int $conforme = 1, ?string $produtos = null, float $renda = 2400, int $apgar = 9, float $peso = 3150)
        => $ins($sqlTri, [$d, $enf, $data, 1, 1, $renda, 0, 0, 0, 0, $apgar, $peso, 0, $equip, $produtos, $conforme]);

    $triagem($ana, $dia(-185), 'freezer', 1, null, 2500, 9, 3200);
    $triagem($larissa, $somar($partoLarissa, 1), 'freezer', 1, null, 3200, 10, 3350);
    $triagem($juliana, $dia(-205), 'duplex', 1, null, 3100, 10, 3400);
    $triagem($mariana, $somar($partoMariana, 1), 'duplex', 1, null, 2800, 9, 3050);
    $triagem($patricia, $dia(-10), 'refrigerador', 1, null, 1700, 8, 2950);
    $triagem($debora, $dia(-72), 'refrigerador', 1, null, 2100, 9, 3100);
    $triagem($beatriz, $dia(-68), 'refrigerador', 1, null, 2200, 9, 3050);
    $triagem($tatiane, $dia(-31), 'freezer', 1, null, 1900, 9, 2980);
    $triagem($renata, $dia(-88), 'freezer', 0, 'Carnes e verduras no mesmo freezer', 1500, 8, 2600);
    $triagem($gabriela, $dia(-78), 'freezer', 1, null, 2700, 9, 3300);
    $triagem($fernanda, $dia(-148), 'freezer', 1, null, 1800, 9, 2900);
    $triagem($vanessa, $dia(-48), 'duplex', 1, null, 2300, 10, 3250);

    $sqlSor = "INSERT INTO sorologia (doadora_id, numero_amostra, data_coleta, resultado) VALUES (?,?,?,?)";
    $sorologia = fn (int $d, int $n, string $data, string $resultado = 'normal') => $ins($sqlSor, [$d, $n, $data, $resultado]);
    $sorologia($ana, 1, $dia(-183));
    $sorologia($ana, 2, $dia(-120));
    $sorologia($ana, 3, $zonaDia(1, -3));
    $sorologia($larissa, 1, $somar($partoLarissa, 2));
    $sorologia($juliana, 1, $dia(-203));
    $sorologia($juliana, 2, $dia(-140));
    $sorologia($mariana, 1, $somar($partoMariana, 2));
    $sorologia($debora, 1, $dia(-70));
    $sorologia($debora, 2, $zonaDia(3, -2));
    $sorologia($beatriz, 1, $dia(-66));
    $sorologia($beatriz, 2, $zonaDia(4, -1));
    $sorologia($tatiane, 1, $dia(-29));
    $sorologia($gabriela, 1, $dia(-76));
    $sorologia($gabriela, 2, $zonaDia(4, -2), 'alterado');
    $sorologia($fernanda, 1, $dia(-146));
    $sorologia($fernanda, 2, $dia(-90));
    $sorologia($fernanda, 3, $dia(-40));
    $sorologia($vanessa, 1, $dia(-46));
    $sorologia($vanessa, 2, $zonaDia(5, -2));

    $sqlVis = "INSERT INTO visita_coleta
      (doadora_id, funcionario_id, data, data_coleta_sangue, frascos_novos, frascos_esterilizados, frascos_recebidos, status)
      VALUES (?,?,?,?,?,?,?,?)";
    $sqlCru = "INSERT INTO frasco_leite_cru
      (visita_coleta_id, recepcao_id, pasteurizacao_id, data_hora_primeira_coleta, volume_ml,
       forma_extracao, cond_prestocagem, estado, classificacao, data, responsavel, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";
    $equipamento = [];
    foreach ($pdo->query("SELECT doadora_id, equipamento_estocagem FROM triagem") as $t) {
        $equipamento[(int) $t['doadora_id']] = $t['equipamento_estocagem'];
    }

    $crus = [];
    $extracoes = ['mecanica_eletrica', 'manual', 'mecanica_manual'];

    $coletar = function (int $d, int $zona, int $semana, array $volumes, ?string $sangue = null, int $entregues = 3)
        use ($ins, $sqlVis, $sqlCru, $zonaDia, $somar, $partos, &$equipamento, &$crus, $extracoes, $enf): array {
        $data = $zonaDia($zona, $semana);
        $visita = $ins($sqlVis, [$d, $enf, $data, $sangue, 0, $entregues, count($volumes), 'realizada']);
        $ids = [];
        foreach ($volumes as $i => $volume) {
            $primeira = $somar($data, -1 - $i) . sprintf(' %02d:%02d:00', 7 + $i * 2, 15 * ($i % 4));
            $tipo = TipoLeiteEnum::porDataDoParto($partos[$d], $primeira)->value;
            $guardado = ($equipamento[$d] ?? 'freezer') === 'freezer' ? 'freezer' : 'congelador';
            $estado = $i === 2 ? 'misto' : 'congelado';
            $id = $ins($sqlCru, [$visita, null, null, $primeira, $volume, $extracoes[($d + $i) % 3], $guardado, $estado, $tipo, $data, 'Enfª Marina Alves', 'coletado']);
            $crus[$id] = ['doadora' => $d, 'volume' => (float) $volume, 'classificacao' => $tipo];
            $ids[] = $id;
        }
        return $ids;
    };
    $agendar = fn (int $d, int $zona, int $semana) => $ins($sqlVis, [$d, $admin, $zonaDia($zona, $semana), null, 0, 0, 0, 'agendada']);
    $cancelar = fn (int $d, int $zona, int $semana) => $ins($sqlVis, [$d, $admin, $zonaDia($zona, $semana), null, 0, 0, 0, 'cancelada']);
    $visitaSemFrasco = fn (int $d, int $zona, int $semana, ?string $sangue) => $ins($sqlVis, [$d, $enf, $zonaDia($zona, $semana), $sangue, 0, 2, 0, 'realizada']);

    $sqlRec = "INSERT INTO recepcao
      (funcionario_id, zona_id, data, municipios, hora_saida, hora_chegada, temperatura_caixa,
       quant_frascos, volume_total, conforme, motivo_descarte)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)";
    $municipios = [1 => 'Marília', 2 => 'Marília', 3 => 'Marília', 4 => 'Marília', 5 => 'Distritos de Marília'];
    $receber = function (int $zona, int $semana, array $ids, float $temperatura = -6.0, ?string $motivo = null)
        use ($ins, $exec, $sqlRec, $zonaDia, &$crus, $municipios, $tec): int {
        $volume = array_sum(array_map(fn ($id) => $crus[$id]['volume'], $ids));
        $conforme = $motivo === null;
        $id = $ins($sqlRec, [$tec, $zona, $zonaDia($zona, $semana), $municipios[$zona], '07:30:00', $zona === 5 ? '12:10:00' : '11:20:00', $temperatura, count($ids), $volume, $conforme ? 1 : 0, $motivo]);
        foreach ($ids as $f) {
            $exec("UPDATE frasco_leite_cru SET recepcao_id = ?, status = ? WHERE id = ?", [$id, $conforme ? 'conforme' : 'descartado', $f]);
        }
        return $id;
    };

    $pasteurizacoes = [];
    $pasteurizar = function (string $data, array $ids) use ($ins, $exec, $farm, &$pasteurizacoes, &$crus): int {
        $id = $ins("INSERT INTO pasteurizacao (funcionario_id, data_pasteurizacao) VALUES (?,?)", [$farm, $data]);
        $pasteurizacoes[$id] = $data;
        foreach ($ids as $f) {
            $exec("UPDATE frasco_leite_cru SET pasteurizacao_id = ?, status = 'pasteurizado' WHERE id = ?", [$id, $f]);
            $crus[$f]['pasteurizacao'] = $id;
        }
        return $id;
    };

    $reenvasar = function (int $p, int $d, array $volumes) use ($ins, &$crus, &$pasteurizacoes): array {
        $doDoador = array_filter($crus, fn ($c) => ($c['pasteurizacao'] ?? null) === $p && $c['doadora'] === $d);
        $total = array_sum(array_column($doDoador, 'volume'));
        if (array_sum($volumes) > $total) {
            throw new RuntimeException("Reenvase maior que o leite cru da doadora {$d} na pasteurização {$p}.");
        }
        $tipo = array_values($doDoador)[0]['classificacao'];
        $ids = [];
        foreach ($volumes as $v) {
            $ids[] = $ins(
                "INSERT INTO frasco_pasteurizado (pasteurizacao_id, doadora_id, volume, classificacao, data_pasteurizacao, status) VALUES (?,?,?,?,?, 'quarentena')",
                [$p, $d, $v, $tipo, $pasteurizacoes[$p]]
            );
        }
        return $ids;
    };

    $analisar = function (int $frasco, string $data, float $dornic = 5.0, string $bgbl = 'negativo') use ($ins, $exec): void {
        $aprovado = $bgbl === 'negativo' && $dornic <= 8 ? 1 : 0;
        $ins(
            "INSERT INTO analise_fisico_quimica (frasco_pasteurizado_id, crematocrito_tc, crematocrito_tg, crematocrito_e, dornic, bgbl, temperatura, data_analise, aprovado)
             VALUES (?,?,?,?,?,?,?,?,?)",
            [$frasco, 5.2 + ($frasco % 4) * 0.4, 3.1 + ($frasco % 3) * 0.3, 620 + ($frasco % 5) * 25, $dornic, $bgbl, 4.0, $data, $aprovado]
        );
        $exec("UPDATE frasco_pasteurizado SET status = ? WHERE id = ?", [$aprovado ? 'disponivel' : 'reprovado', $frasco]);
    };

    $a1 = $coletar($ana, 1, -3, [180, 150], $zonaDia(1, -3));
    $j1 = $coletar($juliana, 2, -3, [170, 140]);
    $b1 = $coletar($beatriz, 4, -3, [160]);
    $g1 = $coletar($gabriela, 4, -3, [150, 120]);
    $f1 = $coletar($fernanda, 5, -3, [200]);
    $receber(1, -3, $a1);
    $receber(2, -3, $j1);
    $receber(4, -3, array_merge($b1, $g1), -7.0);
    $receber(5, -3, $f1, -5.0);

    $p1 = $pasteurizar($zonaDia(1, -2), array_merge($a1, $j1, $b1, $g1, $f1));
    [$fpAna1a, $fpAna1b] = $reenvasar($p1, $ana, [170, 160]);
    [$fpJul1a, $fpJul1b] = $reenvasar($p1, $juliana, [150, 160]);
    [$fpBea1] = $reenvasar($p1, $beatriz, [160]);
    [$fpGab1a, $fpGab1b] = $reenvasar($p1, $gabriela, [130, 140]);
    [$fpFer1a, $fpFer1b] = $reenvasar($p1, $fernanda, [100, 100]);
    foreach ([$fpAna1a, $fpAna1b, $fpJul1a, $fpJul1b, $fpBea1, $fpGab1a, $fpGab1b, $fpFer1a] as $f) {
        $analisar($f, $zonaDia(2, -2));
    }
    $analisar($fpFer1b, $zonaDia(2, -2), 9.5);

    $a2 = $coletar($ana, 1, -2, [160]);
    $l1 = $coletar($larissa, 1, -2, [90, 80], null, 4);
    $cancelar($juliana, 2, -2);
    $d1 = $coletar($debora, 3, -2, [170, 150], $zonaDia(3, -2));
    $t1 = $coletar($tatiane, 4, -2, [140]);
    $g2 = $coletar($gabriela, 4, -2, [130], $zonaDia(4, -2));
    $v1 = $coletar($vanessa, 5, -2, [180, 160], $zonaDia(5, -2));
    $receber(1, -2, array_merge($a2, $l1));
    $receber(3, -2, $d1, -5.5);
    $receber(4, -2, array_merge($t1, $g2), -6.5);
    $receber(5, -2, $v1, -4.5);

    $p2 = $pasteurizar($zonaDia(1, -1), array_merge($a2, $l1, $d1, $t1, $v1));
    [$fpAna2] = $reenvasar($p2, $ana, [160]);
    [$fpLar1a, $fpLar1b] = $reenvasar($p2, $larissa, [90, 80]);
    [$fpDeb1a, $fpDeb1b] = $reenvasar($p2, $debora, [160, 160]);
    [$fpTat1] = $reenvasar($p2, $tatiane, [140]);
    [$fpVan1a, $fpVan1b] = $reenvasar($p2, $vanessa, [170, 170]);
    foreach ([$fpAna2, $fpLar1a, $fpLar1b, $fpDeb1a, $fpDeb1b, $fpTat1, $fpVan1a] as $f) {
        $analisar($f, $zonaDia(2, -1), 4.5);
    }
    $analisar($fpVan1b, $zonaDia(2, -1), 6.0, 'positivo');

    $a3 = $coletar($ana, 1, -1, [170]);
    $l2 = $coletar($larissa, 1, -1, [120, 110]);
    $agendar($camila, 1, -1);
    $j2 = $coletar($juliana, 2, -1, [180]);
    $m1 = $coletar($mariana, 2, -1, [70, 60], $zonaDia(2, -1), 4);
    $d2 = $coletar($debora, 3, -1, [150]);
    $b2 = $coletar($beatriz, 4, -1, [170, 150], $zonaDia(4, -1));
    $t2 = $coletar($tatiane, 4, -1, [160]);
    $f2 = $coletar($fernanda, 5, -1, [190]);
    $cancelar($vanessa, 5, -1);
    $receber(1, -1, array_merge($a3, $l2));
    $receber(2, -1, array_merge($j2, $m1));
    $receber(3, -1, $d2);
    $receber(4, -1, array_merge($b2, $t2), -6.0);
    $receber(5, -1, $f2, -1.0, 'Caixa térmica chegou a -1 °C: acima do limite de -3 °C.');

    $p3 = $pasteurizar($zonaDia(1, 0), array_merge($a3, $l2, $j2, $m1, $d2));
    [$fpAna3] = $reenvasar($p3, $ana, [170]);
    [$fpLar2a, $fpLar2b] = $reenvasar($p3, $larissa, [120, 110]);
    [$fpDeb2] = $reenvasar($p3, $debora, [150]);
    $analisar($fpAna3, $zonaDia(2, 0), 4.0);

    $a4 = $coletar($ana, 1, 0, [160, 140]);
    $l3 = $coletar($larissa, 1, 0, [130]);
    $j3 = $coletar($juliana, 2, 0, [150]);
    $m2 = $coletar($mariana, 2, 0, [90, 80]);
    $coletar($debora, 3, 0, [160, 140]);
    $visitaSemFrasco($patricia, 3, 0, $zonaDia(3, 0));
    $receber(1, 0, array_merge($a4, $l3));
    $receber(2, 0, array_merge($j3, $m2), -5.0);

    $agendar($beatriz, 4, 0);
    $agendar($tatiane, 4, 0);
    $agendar($fernanda, 5, 0);
    $agendar($vanessa, 5, 0);
    $agendar($ana, 1, 1);
    $agendar($larissa, 1, 1);
    $agendar($camila, 1, 1);
    $agendar($juliana, 2, 1);
    $agendar($mariana, 2, 1);

    $exec("UPDATE frasco_leite_cru fc JOIN visita_coleta vc ON vc.id = fc.visita_coleta_id
           SET fc.status = 'descartado' WHERE vc.doadora_id = ? AND fc.status IN ('coletado','conforme')", [$gabriela]);
    $exec("UPDATE frasco_pasteurizado SET status = 'bloqueado' WHERE doadora_id = ? AND status IN ('quarentena','disponivel','alocado')", [$gabriela]);

    $sqlHosp = "INSERT INTO hospital (nome, telefone) VALUES (?,?)";
    $santaCasa = $ins($sqlHosp, ['Santa Casa de Misericórdia de Marília', '(14) 3402-2000']);
    $materno = $ins($sqlHosp, ['Hospital Materno Infantil de Marília', '(14) 3402-1744']);
    $hc = $ins($sqlHosp, ['Hospital das Clínicas de Marília', '(14) 3434-2500']);

    $demanda = fn (int $h, string $data, float $volume, int $bebes, string $status = 'pendente')
        => $ins("INSERT INTO demanda (hospital_id, data_demanda, volume_total, numero_de_bebes, status) VALUES (?,?,?,?,?)", [$h, $data, $volume, $bebes, $status]);
    $receita = fn (int $dem, string $rn, float $volume, string $tipo)
        => $ins("INSERT INTO prescricao (demanda_id, nome_do_rn, volume_prescrito, tipo_leite) VALUES (?,?,?,?)", [$dem, $rn, $volume, $tipo]);
    $alocar = function (int $prescricao, int $frasco) use ($ins, $exec): int {
        $id = $ins("INSERT INTO frasco_distribuicao (prescricao_id, frasco_pasteurizado_id) VALUES (?,?)", [$prescricao, $frasco]);
        $exec("UPDATE frasco_pasteurizado SET status = 'alocado' WHERE id = ?", [$frasco]);
        return $id;
    };
    $distribuir = function (int $dem, string $data, string $setor, int $caixa, string $recebe) use ($ins, $exec, $admin): int {
        $id = $ins(
            "INSERT INTO distribuicao (demanda_id, funcionario_id, data, horario, setor, volume_caixa, temperatura, assinatura_entrega, assinatura_recebimento)
             VALUES (?,?,?,?,?,?,?,?,?)",
            [$dem, $admin, $data, '14:30:00', $setor, $caixa, 4.5, 'Roberto Lima', $recebe]
        );
        $exec("UPDATE frasco_distribuicao fd JOIN prescricao p ON p.id = fd.prescricao_id
               SET fd.distribuicao_id = ? WHERE p.demanda_id = ? AND fd.distribuicao_id IS NULL", [$id, $dem]);
        $exec("UPDATE frasco_pasteurizado fp JOIN frasco_distribuicao fd ON fd.frasco_pasteurizado_id = fp.id
               SET fp.status = 'distribuido' WHERE fd.distribuicao_id = ?", [$id]);
        $exec("UPDATE demanda SET status = 'atendida' WHERE id = ?", [$dem]);
        return $id;
    };
    $administrar = fn (int $alocacao, string $data) => $exec("UPDATE frasco_distribuicao SET data_administracao = ? WHERE id = ?", [$data, $alocacao]);

    $dem1 = $demanda($santaCasa, $zonaDia(3, -2), 330, 2, 'pendente');
    $al = $alocar($receita($dem1, 'RN de Luana Prado', 170, 'maduro'), $fpAna1a);
    $al2 = $alocar($receita($dem1, 'RN de Aline Barros', 160, 'maduro'), $fpJul1b);
    $distribuir($dem1, $zonaDia(4, -2), 'UTI Neonatal', 350, 'Enfª Cláudia Reis');
    $administrar($al, $zonaDia(4, -2));
    $administrar($al2, $zonaDia(5, -2));

    $dem2 = $demanda($materno, $zonaDia(3, -1), 320, 3, 'pendente');
    $al3 = $alocar($receita($dem2, 'RN de Bruna Teles', 90, 'colostro'), $fpLar1a);
    $al4 = $alocar($receita($dem2, 'RN de Kelly Rocha', 80, 'colostro'), $fpLar1b);
    $alocar($receita($dem2, 'RN de Sabrina Lima', 150, 'maduro'), $fpJul1a);
    $distribuir($dem2, $zonaDia(4, -1), 'UCI Neonatal', 300, 'Enfª Paula Martins');
    $administrar($al3, $zonaDia(4, -1));
    $administrar($al4, $zonaDia(5, -1));

    $dem3 = $demanda($hc, $zonaDia(2, 0), 340, 3);
    $alocar($receita($dem3, 'RN de Paula Vieira', 160, 'maduro'), $fpAna1b);
    $receita($dem3, 'RN de Elaine Cruz', 110, 'transicao');
    $receita($dem3, 'RN de Joana Prates', 70, 'colostro');

    $dem4 = $demanda($santaCasa, $base->format('Y-m-d'), 340, 2);
    $alocar($receita($dem4, 'RN de Carla Mota', 140, 'maduro'), $fpTat1);
    $alocar($receita($dem4, 'RN de Rita Nogueira', 200, 'maduro'), $fpDeb1a);

    $sqlDev = "INSERT INTO devolucao_frascos (hospital_id, data, tipo_frasco, qtd_enviada, qtd_recebida) VALUES (?,?,?,?,?)";
    $ins($sqlDev, [$santaCasa, $zonaDia(4, -1), 'tampa_plastica_500ml', 2, 2]);
    $ins($sqlDev, [$materno, $zonaDia(2, 0), 'graduado_200ml', 3, 1]);

    echo "Dados de demonstração criados para {$base->format('d/m/Y')} (" . count($crus) . " frascos de leite cru, 3 hospitais, 13 doadoras).\n";
    echo "Acesso: admin@maisleite.local / MaisLeite@123\n";
} catch (Throwable $e) {
    fwrite(STDERR, "Falha no seed de demonstração: " . $e->getMessage() . "\nExecute composer migrate antes.\n");
    exit(1);
}

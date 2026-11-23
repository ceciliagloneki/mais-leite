CREATE TABLE IF NOT EXISTS funcionario (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cargo VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  status ENUM('ativo','inativo') NOT NULL DEFAULT 'ativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS zona (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  dia_da_semana ENUM('segunda','terca','quarta','quinta','sexta') NOT NULL UNIQUE,
  nome VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO zona (id, dia_da_semana, nome) VALUES
  (1, 'segunda', 'Zona Norte'),
  (2, 'terca', 'Zona Sul'),
  (3, 'quarta', 'Zona Oeste'),
  (4, 'quinta', 'Zona Leste'),
  (5, 'sexta', 'Zona Rural e Maracá');

CREATE TABLE IF NOT EXISTS doadora (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  zona_id INT UNSIGNED NOT NULL,
  data_cad DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  nome VARCHAR(255) NOT NULL,
  data_nasc DATE NOT NULL,
  cartao_sus VARCHAR(15) NOT NULL UNIQUE,
  telefone VARCHAR(20) NULL,
  endereco_rua VARCHAR(255) NULL,
  endereco_numero VARCHAR(20) NULL,
  endereco_bairro VARCHAR(120) NULL,
  nome_bebe VARCHAR(255) NULL,
  data_parto DATE NOT NULL,
  vacina_febre_amarela TINYINT(1) NOT NULL DEFAULT 0,
  vacina_dtpa TINYINT(1) NOT NULL DEFAULT 0,
  transfusao_sangue TINYINT(1) NOT NULL DEFAULT 0,
  data_transfusao VARCHAR(7) NULL COMMENT 'mês/ano (AAAA-MM)',
  tatuagem TINYINT(1) NOT NULL DEFAULT 0,
  data_tatuagem VARCHAR(7) NULL COMMENT 'mês/ano (AAAA-MM)',
  fumante TINYINT(1) NOT NULL DEFAULT 0,
  cigarros_dia INT UNSIGNED NULL,
  consome_alcool TINYINT(1) NOT NULL DEFAULT 0,
  uso_medicacao VARCHAR(255) NULL,
  orientacao_tecnica TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'ordenha, rotulagem e pré-estocagem',
  status ENUM('em_triagem','ativa','inapta','removida') NOT NULL DEFAULT 'em_triagem',
  FOREIGN KEY (zona_id) REFERENCES zona(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS triagem (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  doadora_id INT UNSIGNED NOT NULL UNIQUE,
  funcionario_id INT UNSIGNED NOT NULL,
  data_triagem DATE NOT NULL,
  agua_potavel TINYINT(1) NOT NULL DEFAULT 0,
  esgoto TINYINT(1) NOT NULL DEFAULT 0,
  renda DECIMAL(10,2) NULL,
  infeccao_urinaria TINYINT(1) NOT NULL DEFAULT 0,
  hipertensao TINYINT(1) NOT NULL DEFAULT 0,
  diabetes TINYINT(1) NOT NULL DEFAULT 0,
  hepatite TINYINT(1) NOT NULL DEFAULT 0,
  apgar_bebe TINYINT UNSIGNED NULL,
  peso_bebe DECIMAL(10,2) NULL COMMENT 'gramas',
  malformacao_bebe TINYINT(1) NOT NULL DEFAULT 0,
  equipamento_estocagem ENUM('freezer','refrigerador','duplex') NOT NULL,
  produtos_junto_leite VARCHAR(500) NULL,
  conforme TINYINT(1) NOT NULL,
  FOREIGN KEY (doadora_id) REFERENCES doadora(id),
  FOREIGN KEY (funcionario_id) REFERENCES funcionario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sorologia (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  doadora_id INT UNSIGNED NOT NULL,
  numero_amostra TINYINT UNSIGNED NOT NULL,
  data_coleta DATE NOT NULL,
  resultado ENUM('normal','alterado') NOT NULL,
  UNIQUE (doadora_id, numero_amostra),
  FOREIGN KEY (doadora_id) REFERENCES doadora(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS visita_coleta (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  doadora_id INT UNSIGNED NOT NULL,
  funcionario_id INT UNSIGNED NOT NULL,
  data DATE NOT NULL,
  data_coleta_sangue DATE NULL,
  frascos_novos INT UNSIGNED NOT NULL DEFAULT 0,
  frascos_esterilizados INT UNSIGNED NOT NULL DEFAULT 0,
  frascos_recebidos INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'frascos com leite recebidos da doadora',
  status ENUM('agendada','realizada','cancelada') NOT NULL DEFAULT 'realizada' COMMENT 'agendada -> realizada (ou cancelada)',
  FOREIGN KEY (doadora_id) REFERENCES doadora(id),
  FOREIGN KEY (funcionario_id) REFERENCES funcionario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS recepcao (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  funcionario_id INT UNSIGNED NOT NULL,
  zona_id INT UNSIGNED NOT NULL,
  data DATE NOT NULL,
  municipios VARCHAR(500) NOT NULL,
  hora_saida TIME NOT NULL,
  hora_chegada TIME NOT NULL,
  temperatura_caixa DECIMAL(5,2) NOT NULL,
  quant_frascos INT UNSIGNED NOT NULL,
  volume_total DECIMAL(10,2) NOT NULL,
  conforme TINYINT(1) NOT NULL,
  motivo_descarte VARCHAR(500) NULL,
  FOREIGN KEY (funcionario_id) REFERENCES funcionario(id),
  FOREIGN KEY (zona_id) REFERENCES zona(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pasteurizacao (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  funcionario_id INT UNSIGNED NOT NULL,
  data_pasteurizacao DATE NOT NULL,
  FOREIGN KEY (funcionario_id) REFERENCES funcionario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS frasco_leite_cru (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  visita_coleta_id INT UNSIGNED NOT NULL,
  recepcao_id INT UNSIGNED NULL,
  pasteurizacao_id INT UNSIGNED NULL,
  data_hora_primeira_coleta DATETIME NOT NULL COMMENT 'início da validade do leite cru',
  volume_ml DECIMAL(10,2) NOT NULL,
  forma_extracao ENUM('manual','mecanica_manual','mecanica_eletrica') NOT NULL,
  cond_prestocagem ENUM('congelador','freezer') NOT NULL,
  estado ENUM('refrigerado','congelado','misto') NOT NULL,
  classificacao ENUM('colostro','transicao','maduro') NOT NULL,
  data DATE NOT NULL,
  responsavel VARCHAR(255) NOT NULL,
  status ENUM('coletado','conforme','descartado','pasteurizado') NOT NULL DEFAULT 'coletado',
  FOREIGN KEY (visita_coleta_id) REFERENCES visita_coleta(id),
  FOREIGN KEY (recepcao_id) REFERENCES recepcao(id),
  FOREIGN KEY (pasteurizacao_id) REFERENCES pasteurizacao(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS frasco_pasteurizado (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pasteurizacao_id INT UNSIGNED NOT NULL,
  doadora_id INT UNSIGNED NOT NULL,
  volume DECIMAL(10,2) NOT NULL,
  classificacao ENUM('colostro','transicao','maduro') NOT NULL,
  data_pasteurizacao DATE NOT NULL,
  status ENUM('quarentena','disponivel','reprovado','alocado','distribuido','bloqueado') NOT NULL DEFAULT 'quarentena',
  FOREIGN KEY (pasteurizacao_id) REFERENCES pasteurizacao(id),
  FOREIGN KEY (doadora_id) REFERENCES doadora(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS analise_fisico_quimica (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  frasco_pasteurizado_id INT UNSIGNED NOT NULL UNIQUE,
  crematocrito_tc DECIMAL(6,2) NOT NULL COMMENT 'teor de creme (%)',
  crematocrito_tg DECIMAL(6,2) NOT NULL COMMENT 'teor de gordura (%)',
  crematocrito_e DECIMAL(7,2) NOT NULL COMMENT 'energia (kcal/L)',
  dornic DECIMAL(5,2) NOT NULL COMMENT 'acidez (°D)',
  bgbl ENUM('negativo','positivo') NOT NULL,
  temperatura DECIMAL(5,2) NOT NULL,
  data_analise DATE NOT NULL,
  aprovado TINYINT(1) NOT NULL,
  FOREIGN KEY (frasco_pasteurizado_id) REFERENCES frasco_pasteurizado(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS hospital (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(20) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS demanda (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  hospital_id INT UNSIGNED NOT NULL,
  data_demanda DATE NOT NULL,
  volume_total DECIMAL(10,2) NOT NULL,
  numero_de_bebes INT UNSIGNED NOT NULL,
  status ENUM('pendente','atendida') NOT NULL DEFAULT 'pendente',
  FOREIGN KEY (hospital_id) REFERENCES hospital(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS prescricao (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  demanda_id INT UNSIGNED NOT NULL,
  nome_do_rn VARCHAR(255) NOT NULL,
  volume_prescrito DECIMAL(10,2) NOT NULL,
  tipo_leite ENUM('colostro','transicao','maduro') NOT NULL,
  FOREIGN KEY (demanda_id) REFERENCES demanda(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS distribuicao (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  demanda_id INT UNSIGNED NOT NULL,
  funcionario_id INT UNSIGNED NOT NULL,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  setor VARCHAR(255) NOT NULL,
  volume_caixa SMALLINT UNSIGNED NOT NULL COMMENT '200, 250, 300 ou 350 mL',
  temperatura DECIMAL(5,2) NOT NULL,
  assinatura_entrega VARCHAR(255) NOT NULL,
  assinatura_recebimento VARCHAR(255) NOT NULL,
  FOREIGN KEY (demanda_id) REFERENCES demanda(id),
  FOREIGN KEY (funcionario_id) REFERENCES funcionario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS frasco_distribuicao (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  prescricao_id INT UNSIGNED NOT NULL,
  frasco_pasteurizado_id INT UNSIGNED NOT NULL UNIQUE,
  distribuicao_id INT UNSIGNED NULL,
  data_administracao DATE NULL,
  FOREIGN KEY (prescricao_id) REFERENCES prescricao(id),
  FOREIGN KEY (frasco_pasteurizado_id) REFERENCES frasco_pasteurizado(id),
  FOREIGN KEY (distribuicao_id) REFERENCES distribuicao(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS devolucao_frascos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  hospital_id INT UNSIGNED NOT NULL,
  data DATE NOT NULL,
  tipo_frasco ENUM('tampa_plastica_500ml','graduado_200ml') NOT NULL,
  qtd_enviada INT UNSIGNED NOT NULL,
  qtd_recebida INT UNSIGNED NOT NULL,
  FOREIGN KEY (hospital_id) REFERENCES hospital(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Tempo de geração: 19/09/2026 às 17:59
-- Versão do servidor: 8.0.46-0ubuntu0.24.04.4
-- Versão do PHP: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `mais_leite`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `analise_fisico_quimica`
--

CREATE TABLE `analise_fisico_quimica` (
  `id` int UNSIGNED NOT NULL,
  `frasco_pasteurizado_id` int UNSIGNED NOT NULL,
  `dornic_acidez` decimal(5,2) NOT NULL COMMENT 'Acidez Dornic (°D)',
  `crematocrito_tc` decimal(5,2) DEFAULT NULL COMMENT 'Crematócrito - Coluna Total (mm)',
  `crematocrito_tg` decimal(5,2) DEFAULT NULL COMMENT 'Crematócrito - Coluna de Gordura/Creme (mm)',
  `crematocrito_e_kcal` decimal(6,2) DEFAULT NULL COMMENT 'Crematócrito - Energia calculada (kcal/L)',
  `bgbl_resultado` enum('negativo','positivo') NOT NULL COMMENT 'Resultado do teste BGBL',
  `temperatura` decimal(5,2) DEFAULT NULL,
  `data_analise` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `bebe`
--

CREATE TABLE `bebe` (
  `id` int UNSIGNED NOT NULL,
  `doadora_id` int UNSIGNED NOT NULL,
  `data_nasc` date NOT NULL,
  `apgar` int UNSIGNED DEFAULT NULL,
  `peso` decimal(10,2) DEFAULT NULL,
  `observacoes` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `controle_frascos`
--

CREATE TABLE `controle_frascos` (
  `id` int UNSIGNED NOT NULL,
  `visita_coleta_id` int UNSIGNED NOT NULL,
  `tipo_frasco` varchar(100) NOT NULL,
  `qtd_enviada` int UNSIGNED NOT NULL DEFAULT '0',
  `qtd_recebida` int UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `demanda`
--

CREATE TABLE `demanda` (
  `id` int UNSIGNED NOT NULL,
  `hospital_id` int UNSIGNED NOT NULL,
  `volume_total` decimal(10,2) NOT NULL,
  `numero_de_bebes` int UNSIGNED NOT NULL,
  `data_demanda` date NOT NULL,
  `status_solicitacao` enum('pendente','aprovada','atendida','cancelada') NOT NULL DEFAULT 'pendente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `distribuicao`
--

CREATE TABLE `distribuicao` (
  `id` int UNSIGNED NOT NULL,
  `demanda_id` int UNSIGNED NOT NULL,
  `data` date NOT NULL,
  `horario` time NOT NULL,
  `assinatura_entrega` varchar(255) NOT NULL,
  `assinatura_recebimento` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `doadora`
--

CREATE TABLE `doadora` (
  `id` int UNSIGNED NOT NULL,
  `zona_dia` int UNSIGNED NOT NULL,
  `data_cad` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `nome` varchar(255) NOT NULL,
  `data_nasc` date NOT NULL,
  `cartao_sus` varchar(15) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `vacina_febre_amarela` tinyint(1) NOT NULL,
  `vacina_dtpa` tinyint(1) NOT NULL,
  `transfusao_sangue` tinyint(1) NOT NULL,
  `tatuagem` tinyint(1) NOT NULL,
  `fumante` tinyint(1) NOT NULL,
  `consome_alcool` tinyint(1) NOT NULL,
  `uso_medicacao` varchar(255) DEFAULT NULL,
  `observacoes` varchar(255) NOT NULL,
  `elegibilidade` enum('ativa','inativa') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'ativa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `endereco`
--

CREATE TABLE `endereco` (
  `doadora_id` int UNSIGNED NOT NULL,
  `cep` varchar(8) NOT NULL,
  `rua` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `numero` varchar(10) DEFAULT NULL,
  `cidade` varchar(255) NOT NULL,
  `uf` char(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `frasco`
--

CREATE TABLE `frasco` (
  `id` int UNSIGNED NOT NULL,
  `tipo_frasco` varchar(100) NOT NULL,
  `volume_total` decimal(10,2) NOT NULL,
  `estado` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `frasco_cru_pasteurizacao`
--

CREATE TABLE `frasco_cru_pasteurizacao` (
  `frasco_cru_pasteurizacao` int UNSIGNED NOT NULL,
  `pasteurizacao_id` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `frasco_distribuicao`
--

CREATE TABLE `frasco_distribuicao` (
  `id` int UNSIGNED NOT NULL,
  `prescricao_id` int UNSIGNED NOT NULL,
  `distribuicao_id` int UNSIGNED NOT NULL,
  `frasco_pasteurizado_id` int UNSIGNED NOT NULL,
  `nome_do_receptor` varchar(45) NOT NULL,
  `volume_ml` decimal(10,2) NOT NULL,
  `data_administracao` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `frasco_leite_cru`
--

CREATE TABLE `frasco_leite_cru` (
  `frasco_id` int UNSIGNED NOT NULL,
  `funcionario_id` int UNSIGNED NOT NULL,
  `visita_coleta_id` int UNSIGNED NOT NULL,
  `recepcao_blh_id` int UNSIGNED DEFAULT NULL,
  `data_hora_coleta` datetime NOT NULL,
  `forma_extracao` enum('manual','mecanica') NOT NULL,
  `cond_prestocagem` enum('congelador','freezer') NOT NULL,
  `estado` enum('refrigerado','congelado','misto') NOT NULL,
  `classificacao` enum('colostro','transicao','maduro') NOT NULL,
  `data` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `frasco_pasteurizado`
--

CREATE TABLE `frasco_pasteurizado` (
  `id` int UNSIGNED NOT NULL,
  `pasteurizacao_id` int UNSIGNED NOT NULL,
  `numero_frasco` varchar(50) NOT NULL,
  `volume` decimal(10,2) NOT NULL,
  `data_pasteurizacao` date NOT NULL,
  `classificacao` enum('colostro','transicao','maduro') NOT NULL,
  `doadora_id` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `funcionario`
--

CREATE TABLE `funcionario` (
  `id` int UNSIGNED NOT NULL,
  `nome` varchar(255) NOT NULL,
  `cargo` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `status` enum('ativo','inativo') NOT NULL DEFAULT 'ativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `hospital`
--

CREATE TABLE `hospital` (
  `id` int UNSIGNED NOT NULL,
  `nome` varchar(255) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `status` enum('ativo','inativo') NOT NULL DEFAULT 'ativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `pasteurizacao`
--

CREATE TABLE `pasteurizacao` (
  `id` int UNSIGNED NOT NULL,
  `funcionario_id` int UNSIGNED NOT NULL,
  `data_descongelamento` datetime DEFAULT NULL,
  `data_pasteurizacao` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `prescricao`
--

CREATE TABLE `prescricao` (
  `id` int UNSIGNED NOT NULL,
  `demanda_id` int UNSIGNED NOT NULL,
  `volume_prescrito` decimal(10,2) NOT NULL,
  `nome_do_rn` varchar(100) NOT NULL,
  `tipo_leite` enum('colostro','transicao','maduro') NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `recepcao_blh`
--

CREATE TABLE `recepcao_blh` (
  `id` int UNSIGNED NOT NULL,
  `funcionario_id` int UNSIGNED NOT NULL,
  `zona_dia` int UNSIGNED NOT NULL,
  `data` date NOT NULL,
  `hora_saida` time NOT NULL,
  `hora_chegada` time NOT NULL,
  `temperatura_caixa` decimal(5,2) NOT NULL,
  `quant_frascos` int UNSIGNED NOT NULL DEFAULT '0',
  `volume_total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `conformidade` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `sorologia`
--

CREATE TABLE `sorologia` (
  `id` int UNSIGNED NOT NULL,
  `doadora_id` int UNSIGNED NOT NULL,
  `nome_do_teste` varchar(100) NOT NULL,
  `data_coleta` datetime NOT NULL,
  `numero_amostra` tinyint UNSIGNED NOT NULL,
  `resultado` enum('normal','alterado') NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `triagem`
--

CREATE TABLE `triagem` (
  `id` int UNSIGNED NOT NULL,
  `funcionario_id` int UNSIGNED NOT NULL,
  `doadora_id` int UNSIGNED NOT NULL,
  `data_triagem` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `renda` decimal(10,2) DEFAULT NULL,
  `condicao_moradia` varchar(500) DEFAULT NULL,
  `intercorrencias_gestacao` varchar(500) DEFAULT NULL,
  `equipamentos_estocagem` varchar(500) DEFAULT NULL,
  `produtos_juntos_leite` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `visita_coleta`
--

CREATE TABLE `visita_coleta` (
  `id` int UNSIGNED NOT NULL,
  `funcionario_id` int UNSIGNED NOT NULL,
  `doadora_id` int UNSIGNED NOT NULL,
  `data` date NOT NULL,
  `hora_coleta` time DEFAULT NULL,
  `volume_doado` decimal(10,2) DEFAULT NULL,
  `status` enum('agendada','realizada','cancelada') NOT NULL DEFAULT 'agendada'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `zona`
--

CREATE TABLE `zona` (
  `id` int UNSIGNED NOT NULL,
  `dia_da_semana` enum('segunda','terca','quarta','quinta','sexta') NOT NULL,
  `nome` enum('norte','sul','oeste','leste','rural_maraca') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `analise_fisico_quimica`
--
ALTER TABLE `analise_fisico_quimica`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_tbanalisefisicoquimica_frasco` (`frasco_pasteurizado_id`);

--
-- Índices de tabela `bebe`
--
ALTER TABLE `bebe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tbbebedoadora_doadora` (`doadora_id`);

--
-- Índices de tabela `controle_frascos`
--
ALTER TABLE `controle_frascos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tbcontrolefrascos_visita` (`visita_coleta_id`);

--
-- Índices de tabela `demanda`
--
ALTER TABLE `demanda`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tbdemanda_hospital` (`hospital_id`);

--
-- Índices de tabela `distribuicao`
--
ALTER TABLE `distribuicao`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tbdistribuicao_demanda` (`demanda_id`);

--
-- Índices de tabela `doadora`
--
ALTER TABLE `doadora`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tbdoadora_zona` (`zona_dia`);

--
-- Índices de tabela `endereco`
--
ALTER TABLE `endereco`
  ADD PRIMARY KEY (`doadora_id`);

--
-- Índices de tabela `frasco`
--
ALTER TABLE `frasco`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `frasco_cru_pasteurizacao`
--
ALTER TABLE `frasco_cru_pasteurizacao`
  ADD PRIMARY KEY (`frasco_cru_pasteurizacao`,`pasteurizacao_id`),
  ADD KEY `idx_tbfclp_pasteurizacao` (`pasteurizacao_id`);

--
-- Índices de tabela `frasco_distribuicao`
--
ALTER TABLE `frasco_distribuicao`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_tbfrascodistribuicao_frasco` (`frasco_pasteurizado_id`),
  ADD KEY `idx_tbfrascodistribuicao_prescricao` (`prescricao_id`),
  ADD KEY `idx_tbfrascodistribuicao_distribuicao` (`distribuicao_id`);

--
-- Índices de tabela `frasco_leite_cru`
--
ALTER TABLE `frasco_leite_cru`
  ADD PRIMARY KEY (`frasco_id`),
  ADD KEY `idx_tbfracoleitecru_funcionario` (`funcionario_id`),
  ADD KEY `idx_tbfracoleitecru_visita` (`visita_coleta_id`),
  ADD KEY `idx_tbfracoleitecru_recepcao` (`recepcao_blh_id`);

--
-- Índices de tabela `frasco_pasteurizado`
--
ALTER TABLE `frasco_pasteurizado`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tbfrascopasteurizado_pasteurizacao` (`pasteurizacao_id`),
  ADD KEY `fk_tbfrascopasteurizacao_tbdoadora` (`doadora_id`);

--
-- Índices de tabela `funcionario`
--
ALTER TABLE `funcionario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_funcionario_email` (`email`);

--
-- Índices de tabela `hospital`
--
ALTER TABLE `hospital`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `pasteurizacao`
--
ALTER TABLE `pasteurizacao`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tbpasteurizacao_funcionario` (`funcionario_id`);

--
-- Índices de tabela `prescricao`
--
ALTER TABLE `prescricao`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tbprescricao_demanda` (`demanda_id`);

--
-- Índices de tabela `recepcao_blh`
--
ALTER TABLE `recepcao_blh`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tbrecepcaoblh_funcionario` (`funcionario_id`),
  ADD KEY `idx_tbrecepcaoblh_zona` (`zona_dia`);

--
-- Índices de tabela `sorologia`
--
ALTER TABLE `sorologia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tbsorologia_doadora` (`doadora_id`);

--
-- Índices de tabela `triagem`
--
ALTER TABLE `triagem`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_tbtriagem_doadora` (`doadora_id`),
  ADD KEY `idx_tbtriagem_funcionario` (`funcionario_id`);

--
-- Índices de tabela `visita_coleta`
--
ALTER TABLE `visita_coleta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tbvisitacoleta_funcionario` (`funcionario_id`),
  ADD KEY `idx_tbvisitacoleta_doadora` (`doadora_id`);

--
-- Índices de tabela `zona`
--
ALTER TABLE `zona`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_tbzona_dia` (`dia_da_semana`),
  ADD UNIQUE KEY `uq_tbzona_nome` (`nome`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `analise_fisico_quimica`
--
ALTER TABLE `analise_fisico_quimica`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `bebe`
--
ALTER TABLE `bebe`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `controle_frascos`
--
ALTER TABLE `controle_frascos`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `demanda`
--
ALTER TABLE `demanda`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `distribuicao`
--
ALTER TABLE `distribuicao`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `doadora`
--
ALTER TABLE `doadora`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `frasco`
--
ALTER TABLE `frasco`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `frasco_distribuicao`
--
ALTER TABLE `frasco_distribuicao`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `frasco_pasteurizado`
--
ALTER TABLE `frasco_pasteurizado`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `funcionario`
--
ALTER TABLE `funcionario`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `hospital`
--
ALTER TABLE `hospital`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pasteurizacao`
--
ALTER TABLE `pasteurizacao`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `prescricao`
--
ALTER TABLE `prescricao`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `recepcao_blh`
--
ALTER TABLE `recepcao_blh`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `sorologia`
--
ALTER TABLE `sorologia`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `triagem`
--
ALTER TABLE `triagem`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `visita_coleta`
--
ALTER TABLE `visita_coleta`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `zona`
--
ALTER TABLE `zona`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `analise_fisico_quimica`
--
ALTER TABLE `analise_fisico_quimica`
  ADD CONSTRAINT `fk_tbanalisefisicoquimica_tbfrascopasteurizado` FOREIGN KEY (`frasco_pasteurizado_id`) REFERENCES `frasco_pasteurizado` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `bebe`
--
ALTER TABLE `bebe`
  ADD CONSTRAINT `fk_tbbebedoadora_tbdoadora` FOREIGN KEY (`doadora_id`) REFERENCES `doadora` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `controle_frascos`
--
ALTER TABLE `controle_frascos`
  ADD CONSTRAINT `fk_tbcontrolefrascos_tbvisitacoleta` FOREIGN KEY (`visita_coleta_id`) REFERENCES `visita_coleta` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `demanda`
--
ALTER TABLE `demanda`
  ADD CONSTRAINT `fk_tbdemanda_tbhospital` FOREIGN KEY (`hospital_id`) REFERENCES `hospital` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Restrições para tabelas `distribuicao`
--
ALTER TABLE `distribuicao`
  ADD CONSTRAINT `fk_tbdistribuicao_tbdemanda` FOREIGN KEY (`demanda_id`) REFERENCES `demanda` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Restrições para tabelas `doadora`
--
ALTER TABLE `doadora`
  ADD CONSTRAINT `fk_tbdoadora_tbzona` FOREIGN KEY (`zona_dia`) REFERENCES `zona` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Restrições para tabelas `endereco`
--
ALTER TABLE `endereco`
  ADD CONSTRAINT `fk_tbendereco_tbdoadora` FOREIGN KEY (`doadora_id`) REFERENCES `doadora` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `frasco_cru_pasteurizacao`
--
ALTER TABLE `frasco_cru_pasteurizacao`
  ADD CONSTRAINT `fk_tbfclp_tbfracoleitecru` FOREIGN KEY (`frasco_cru_pasteurizacao`) REFERENCES `frasco_leite_cru` (`frasco_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tbfclp_tbpasteurizacao` FOREIGN KEY (`pasteurizacao_id`) REFERENCES `pasteurizacao` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Restrições para tabelas `frasco_distribuicao`
--
ALTER TABLE `frasco_distribuicao`
  ADD CONSTRAINT `fk_tbfrascodistribuicao_tbdistribuicao` FOREIGN KEY (`distribuicao_id`) REFERENCES `distribuicao` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tbfrascodistribuicao_tbfrascopasteurizado` FOREIGN KEY (`frasco_pasteurizado_id`) REFERENCES `frasco_pasteurizado` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tbfrascodistribuicao_tbprescricao` FOREIGN KEY (`prescricao_id`) REFERENCES `prescricao` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Restrições para tabelas `frasco_leite_cru`
--
ALTER TABLE `frasco_leite_cru`
  ADD CONSTRAINT `fk_tbfracoleitecru_tbfrasco` FOREIGN KEY (`frasco_id`) REFERENCES `frasco` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tbfracoleitecru_tbfuncionario` FOREIGN KEY (`funcionario_id`) REFERENCES `funcionario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tbfracoleitecru_tbrecepcaoblh` FOREIGN KEY (`recepcao_blh_id`) REFERENCES `recepcao_blh` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tbfracoleitecru_tbvisitacoleta` FOREIGN KEY (`visita_coleta_id`) REFERENCES `visita_coleta` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Restrições para tabelas `frasco_pasteurizado`
--
ALTER TABLE `frasco_pasteurizado`
  ADD CONSTRAINT `fk_tbfrascopasteurizacao_tbdoadora` FOREIGN KEY (`doadora_id`) REFERENCES `doadora` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tbfrascopasteurizado_tbpasteurizacao` FOREIGN KEY (`pasteurizacao_id`) REFERENCES `pasteurizacao` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Restrições para tabelas `pasteurizacao`
--
ALTER TABLE `pasteurizacao`
  ADD CONSTRAINT `fk_tbpasteurizacao_tbfuncionario` FOREIGN KEY (`funcionario_id`) REFERENCES `funcionario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Restrições para tabelas `prescricao`
--
ALTER TABLE `prescricao`
  ADD CONSTRAINT `fk_tbprescricao_tbdemanda` FOREIGN KEY (`demanda_id`) REFERENCES `demanda` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `recepcao_blh`
--
ALTER TABLE `recepcao_blh`
  ADD CONSTRAINT `fk_tbrecepcaoblh_tbfuncionario` FOREIGN KEY (`funcionario_id`) REFERENCES `funcionario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tbrecepcaoblh_tbzona` FOREIGN KEY (`zona_dia`) REFERENCES `zona` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Restrições para tabelas `sorologia`
--
ALTER TABLE `sorologia`
  ADD CONSTRAINT `fk_tbsorologia_tbdoadora` FOREIGN KEY (`doadora_id`) REFERENCES `doadora` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `triagem`
--
ALTER TABLE `triagem`
  ADD CONSTRAINT `fk_tbtriagem_tbdoadora` FOREIGN KEY (`doadora_id`) REFERENCES `doadora` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tbtriagem_tbfuncionario` FOREIGN KEY (`funcionario_id`) REFERENCES `funcionario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Restrições para tabelas `visita_coleta`
--
ALTER TABLE `visita_coleta`
  ADD CONSTRAINT `fk_tbvisitacoleta_tbdoadora` FOREIGN KEY (`doadora_id`) REFERENCES `doadora` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tbvisitacoleta_tbfuncionario` FOREIGN KEY (`funcionario_id`) REFERENCES `funcionario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

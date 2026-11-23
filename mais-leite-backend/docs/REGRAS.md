# Regras de negócio (PDF) e onde estão no código

As regras ficam nos **services**. Os DTOs só validam formato e campos obrigatórios.

| Regra do PDF | Onde está |
| --- | --- |
| Transfusão/tatuagem exigem mês/ano; fumante exige cigarros por dia | `CreateDoadoraDTO` |
| Doadora ATIVA = triagem conforme + 1ª amostra de sorologia normal; triagem não conforme = INAPTA | `DoadoraService::atualizarStatus` |
| **Regra de ouro:** sorologia alterada remove a doadora, descarta o leite cru e bloqueia o pasteurizado não entregue | `DoadoraService::registrarSorologia` |
| Visita só para doadora em triagem ou ativa; frasco de leite só de doadora ativa | `ColetaDomiciliarService` |
| Volume doado da visita = soma dos frascos crus | `ColetaDomiciliarRepository::findAll` |
| Cada zona tem um dia fixo da semana: visita só é agendada, registrada ou lançada nesse dia; não se registra visita futura | `ColetaDomiciliarService::validarDiaDaZona` |
| Classificação do leite cru calculada pela data do parto × 1ª coleta (colostro até 7 dias, transição até 14, maduro depois) | `TipoLeiteEnum::porDataDoParto` |
| Recepção: todos os frascos da caixa térmica são da mesma zona | `RecepcaoService::create` |
| Recepção não conforme exige motivo do descarte; frascos ficam conformes ou descartados | `CreateRecepcaoDTO`, `RecepcaoService::create` |
| Quantidade e volume total da recepção calculados pelos frascos | `RecepcaoService::create` |
| Só frasco cru conforme entra na pasteurização | `PasteurizacaoService::create` |
| Reenvase separado por doadora: volume ≤ leite cru da doadora; mesma classificação (deduzida quando a doadora tem um só tipo) | `PasteurizacaoService::reenvasar` |
| Nova etiqueta: nº do frasco, nº da doadora, volume e data da pasteurização | tabela `frasco_pasteurizado` |
| Frasco fica em quarentena até a análise; BGBL negativo e Dornic ≤ 8 °D = disponível | `PasteurizacaoService::analisar` |
| Matching C/T/M: o frasco precisa ser do tipo prescrito para o RN | `DistribuicaoService::alocar` |
| Ficha de distribuição leva os frascos separados do pedido; frascos ficam distribuídos | `DistribuicaoService::create` |
| Caixa térmica com volume padronizado (200, 250, 300 ou 350 mL) | `CreateDistribuicaoDTO` |
| Baixa (data de administração) só depois da entrega | `DistribuicaoService::registrarAdministracao` |
| Devolução: recebidos ≤ enviados; faltantes calculados | `CreateDevolucaoDTO`, `DevolucaoFrascosRepository` |
| Rastreabilidade: frasco → análise → frascos crus → doadora → sorologia → RN | `RelatorioService::rastreabilidade` |

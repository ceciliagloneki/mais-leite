import { useMemo } from "react";

import { useFrascosCrus, useRecepcoes, useVisitas } from "@/hooks/use-coletas";
import { useAlocacoes, useDistribuicoes } from "@/hooks/use-distribuicao";
import { useFrascosPasteurizados, usePasteurizacoes } from "@/hooks/use-processamento";
import type { PassoProgresso } from "@/components/LinhaDoTempo";
import type { FrascoCru, Recepcao, Visita } from "@/types/coleta";
import type { Alocacao, Distribuicao } from "@/types/distribuicao";
import type { FrascoPasteurizado, Pasteurizacao } from "@/types/processamento";

export type Etapa =
  | "aguardando_recepcao"
  | "descartado"
  | "aguardando_pasteurizacao"
  | "aguardando_reenvase"
  | "em_analise"
  | "reprovado"
  | "liberado"
  | "separado"
  | "entregue"
  | "dado_ao_bebe"
  | "bloqueado";

export const ETAPAS: Record<Etapa, { texto: string; status: string; ordem: number }> = {
  aguardando_recepcao: { texto: "Aguardando recepção", status: "pendente", ordem: 1 },
  descartado: { texto: "Descartado na recepção", status: "descartado", ordem: 2 },
  aguardando_pasteurizacao: { texto: "Aguardando pasteurização", status: "pendente", ordem: 3 },
  aguardando_reenvase: { texto: "Aguardando reenvase", status: "pendente", ordem: 4 },
  em_analise: { texto: "Em análise", status: "quarentena", ordem: 5 },
  reprovado: { texto: "Reprovado na análise", status: "reprovado", ordem: 6 },
  bloqueado: { texto: "Bloqueado", status: "bloqueado", ordem: 6 },
  liberado: { texto: "Liberado para uso", status: "disponivel", ordem: 7 },
  separado: { texto: "Separado para um bebê", status: "alocado", ordem: 8 },
  entregue: { texto: "Entregue ao hospital", status: "distribuido", ordem: 9 },
  dado_ao_bebe: { texto: "Dado ao bebê", status: "atendida", ordem: 10 },
};

export interface FrascoProcessado extends FrascoPasteurizado {
  alocacao?: Alocacao;
  distribuicao?: Distribuicao;
}

export interface CaminhoFrasco {
  cru: FrascoCru;
  visita?: Visita;
  recepcao?: Recepcao;
  pasteurizacao?: Pasteurizacao;
  processados: FrascoProcessado[];
  etapa: Etapa;
}

function etapaDoProcessado(f: FrascoProcessado): Etapa {
  if (f.alocacao?.data_administracao) return "dado_ao_bebe";
  if (f.status === "distribuido" || f.alocacao?.distribuicao_id) return "entregue";
  if (f.status === "alocado") return "separado";
  if (f.status === "disponivel") return "liberado";
  if (f.status === "reprovado") return "reprovado";
  if (f.status === "bloqueado") return "bloqueado";
  return "em_analise";
}

function etapaDoCaminho(cru: FrascoCru, processados: FrascoProcessado[]): Etapa {
  if (cru.status === "coletado") return "aguardando_recepcao";
  if (cru.status === "descartado") return "descartado";
  if (cru.status === "conforme") return "aguardando_pasteurizacao";
  if (processados.length === 0) return "aguardando_reenvase";
  return processados.map(etapaDoProcessado).sort((a, b) => ETAPAS[b].ordem - ETAPAS[a].ordem)[0];
}

export function passosDoCaminho(c: CaminhoFrasco): PassoProgresso[] {
  const e = c.etapa;
  const ordem = ETAPAS[e].ordem;
  const passou = (minimo: number) => ordem >= minimo && e !== "descartado";
  const analiseFalhou = e === "reprovado" || e === "bloqueado";
  return [
    { rotulo: "Coleta", estado: "feito" },
    { rotulo: "Recepção", estado: e === "descartado" ? "falhou" : e === "aguardando_recepcao" ? "atual" : "feito" },
    { rotulo: "Pasteurização", estado: e === "aguardando_pasteurizacao" ? "atual" : passou(4) ? "feito" : "pendente" },
    { rotulo: "Reenvase", estado: e === "aguardando_reenvase" ? "atual" : passou(5) ? "feito" : "pendente" },
    { rotulo: "Análise", estado: analiseFalhou ? "falhou" : e === "em_analise" ? "atual" : passou(7) ? "feito" : "pendente" },
    { rotulo: "Entrega", estado: e === "liberado" || e === "separado" ? "atual" : passou(9) && !analiseFalhou ? "feito" : "pendente" },
  ];
}

export function useCaminhoDosFrascos() {
  const crus = useFrascosCrus();
  const visitas = useVisitas();
  const recepcoes = useRecepcoes();
  const pasteurizacoes = usePasteurizacoes();
  const processados = useFrascosPasteurizados();
  const alocacoes = useAlocacoes();
  const distribuicoes = useDistribuicoes();

  const consultas = [crus, visitas, recepcoes, pasteurizacoes, processados, alocacoes, distribuicoes];
  const carregando = consultas.some((c) => c.isLoading);
  const erro = consultas.find((c) => c.error)?.error ?? null;

  const caminhos = useMemo<CaminhoFrasco[]>(() => {
    const porId = <T extends { id: number }>(lista: T[] | undefined) => new Map((lista ?? []).map((x) => [x.id, x]));
    const visitaPorId = porId(visitas.data);
    const recepcaoPorId = porId(recepcoes.data);
    const pasteurizacaoPorId = porId(pasteurizacoes.data);
    const distribuicaoPorId = porId(distribuicoes.data);
    const alocacaoPorFrasco = new Map((alocacoes.data ?? []).map((a) => [a.frasco_pasteurizado_id, a]));

    const completos: FrascoProcessado[] = (processados.data ?? []).map((f) => {
      const alocacao = alocacaoPorFrasco.get(f.id);
      return { ...f, alocacao, distribuicao: alocacao?.distribuicao_id ? distribuicaoPorId.get(alocacao.distribuicao_id) : undefined };
    });

    return (crus.data ?? []).map((cru) => {
      const meus = cru.pasteurizacao_id ? completos.filter((f) => f.pasteurizacao_id === cru.pasteurizacao_id && f.doadora_id === cru.doadora_id) : [];
      return {
        cru,
        visita: visitaPorId.get(cru.visita_coleta_id),
        recepcao: cru.recepcao_id ? recepcaoPorId.get(cru.recepcao_id) : undefined,
        pasteurizacao: cru.pasteurizacao_id ? pasteurizacaoPorId.get(cru.pasteurizacao_id) : undefined,
        processados: meus,
        etapa: etapaDoCaminho(cru, meus),
      };
    });
  }, [crus.data, visitas.data, recepcoes.data, pasteurizacoes.data, processados.data, alocacoes.data, distribuicoes.data]);

  return { caminhos, carregando, erro };
}

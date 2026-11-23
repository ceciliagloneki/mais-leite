import type { TipoLeite } from "./doadora";

export interface Pasteurizacao {
  id: number;
  data_pasteurizacao: string;
  funcionario_nome: string;
  quant_frascos_crus: number;
  volume_cru: string;
  quant_frascos_pasteurizados: number;
  volume_reenvasado: string;
}

export interface FrascoPasteurizado {
  id: number;
  pasteurizacao_id: number;
  doadora_id: number;
  volume: string;
  classificacao: TipoLeite;
  data_pasteurizacao: string;
  status: "quarentena" | "disponivel" | "reprovado" | "alocado" | "distribuido" | "bloqueado";
  crematocrito_tc: string | null;
  crematocrito_tg: string | null;
  crematocrito_e: string | null;
  dornic: string | null;
  bgbl: string | null;
  temperatura: string | null;
  data_analise: string | null;
  aprovado: number | null;
}

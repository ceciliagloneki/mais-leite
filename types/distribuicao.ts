import type { TipoLeite } from "./doadora";

export interface Alocacao {
  id: number;
  prescricao_id: number;
  frasco_pasteurizado_id: number;
  distribuicao_id: number | null;
  data_administracao: string | null;
  volume: string;
  classificacao: TipoLeite;
  frasco_status: string;
  doadora_id: number;
  nome_do_rn: string;
  tipo_leite: TipoLeite;
  demanda_id: number;
  hospital_nome: string;
}

export interface Distribuicao {
  id: number;
  demanda_id: number;
  hospital_nome: string;
  data: string;
  horario: string;
  setor: string;
  volume_caixa: number;
  temperatura: string;
  assinatura_entrega: string;
  assinatura_recebimento: string;
  quant_frascos: number;
}

export interface FichaDistribuicao extends Distribuicao {
  frascos: Alocacao[];
}

export interface Devolucao {
  id: number;
  hospital_id: number;
  hospital_nome: string;
  data: string;
  tipo_frasco: string;
  qtd_enviada: number;
  qtd_recebida: number;
  faltam: number;
}

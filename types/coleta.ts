import type { TipoLeite } from "./doadora";

export type StatusVisita = "agendada" | "realizada" | "cancelada";

export interface Visita {
  id: number;
  status: StatusVisita;
  doadora_status: string;
  telefone: string | null;
  endereco_rua: string | null;
  endereco_numero: string | null;
  endereco_bairro: string | null;
  data: string;
  doadora_id: number;
  doadora_nome: string;
  zona_nome: string;
  dia_da_semana: string;
  data_coleta_sangue: string | null;
  frascos_novos: number;
  frascos_esterilizados: number;
  frascos_recebidos?: number;
  data_parto?: string | null;
  equipamento_estocagem?: string | null;
  funcionario_nome: string;
  quant_frascos: number;
  volume_doado: string;
}

export interface FrascoCru {
  id: number;
  visita_coleta_id: number;
  recepcao_id: number | null;
  pasteurizacao_id: number | null;
  data_hora_primeira_coleta: string;
  volume_ml: string;
  forma_extracao: string;
  cond_prestocagem: string;
  estado: string;
  classificacao: TipoLeite;
  data: string;
  responsavel: string;
  status: "coletado" | "conforme" | "descartado" | "pasteurizado";
  doadora_id: number;
  doadora_nome: string;
  doadora_data_nasc: string;
  zona_id: number;
}

export interface Recepcao {
  id: number;
  data: string;
  zona_nome: string;
  municipios: string;
  hora_saida: string;
  hora_chegada: string;
  temperatura_caixa: string;
  quant_frascos: number;
  volume_total: string;
  conforme: number;
  motivo_descarte: string | null;
  funcionario_nome: string;
}

export type StatusDoadora = "em_triagem" | "ativa" | "inapta" | "removida";
export type TipoLeite = "colostro" | "transicao" | "maduro";

export interface Zona {
  id: number;
  dia_da_semana: string;
  nome: string;
}

export interface Doadora {
  id: number;
  nome: string;
  cartao_sus: string;
  telefone: string | null;
  data_cad: string;
  data_nasc: string;
  status: StatusDoadora;
  zona_id: number;
  zona_nome: string;
  dia_da_semana: string;
}

export interface Triagem {
  data_triagem: string;
  agua_potavel: number;
  esgoto: number;
  renda: string | null;
  infeccao_urinaria: number;
  hipertensao: number;
  diabetes: number;
  hepatite: number;
  apgar_bebe: number | null;
  peso_bebe: string | null;
  malformacao_bebe: number;
  equipamento_estocagem: string;
  produtos_junto_leite: string | null;
  conforme: number;
}

export interface Sorologia {
  id: number;
  numero_amostra: number;
  data_coleta: string;
  resultado: "normal" | "alterado";
}

export interface DoadoraDetalhe extends Doadora {
  endereco_rua: string | null;
  endereco_numero: string | null;
  endereco_bairro: string | null;
  nome_bebe: string | null;
  data_parto: string;
  vacina_febre_amarela: number;
  vacina_dtpa: number;
  transfusao_sangue: number;
  data_transfusao: string | null;
  tatuagem: number;
  data_tatuagem: string | null;
  fumante: number;
  cigarros_dia: number | null;
  consome_alcool: number;
  uso_medicacao: string | null;
  triagem: Triagem | null;
  sorologias: Sorologia[];
}

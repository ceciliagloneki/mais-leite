import type { TipoLeite } from "./doadora";

export interface Hospital {
  id: number;
  nome: string;
  telefone: string | null;
}

export interface Demanda {
  id: number;
  hospital_id: number;
  hospital_nome: string;
  data_demanda: string;
  volume_total: string;
  numero_de_bebes: number;
  status: "pendente" | "atendida";
  quant_prescricoes: number;
}

export interface Prescricao {
  id: number;
  demanda_id: number;
  nome_do_rn: string;
  volume_prescrito: string;
  tipo_leite: TipoLeite;
  data_demanda: string;
  demanda_status: "pendente" | "atendida";
  hospital_nome: string;
  volume_alocado: string;
}

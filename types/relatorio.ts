export interface Dashboard {
  doadoras: { status: string; total: number }[];
  frascos_crus: { status: string; total: number; volume: string }[];
  estoque: { status: string; classificacao: string; total: number; volume: string }[];
  devolucoes_pendentes: {
    hospital_nome: string;
    tipo_frasco: string;
    enviados: number;
    recebidos: number;
    faltam: number;
  }[];
}

export type Doadora_Status = "Ativa" | "Em Triagem" | "Suspensa" | "Inativa";

export interface Doadora {
  id: string;
  nome: string;
  cartaoSus: string;
  telefone: string;
  zona: string;
  dataCadastro: string; // date string; formatted for display via date-fns
  status: Doadora_Status;
  quantidadeColetas: number;
}

export interface Funcionario {
  id: number;
  nome: string;
  cargo: string;
  email: string;
  status: "ativo" | "inativo";
}

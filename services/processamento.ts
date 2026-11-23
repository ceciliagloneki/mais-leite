import { api, post } from "./api";
import type { FrascoPasteurizado, Pasteurizacao } from "@/types/processamento";

export const listarPasteurizacoes = () => api<Pasteurizacao[]>("/pasteurizacoes");
export const criarPasteurizacao = (dados: unknown) => post("/pasteurizacoes", dados);
export const reenvasar = (pasteurizacaoId: number, dados: unknown) => post(`/pasteurizacoes/${pasteurizacaoId}/frascos`, dados);

export const listarFrascosPasteurizados = (status?: string) =>
  api<FrascoPasteurizado[]>(status ? `/frascos-pasteurizados?status=${status}` : "/frascos-pasteurizados");
export const registrarAnalise = (frascoId: number, dados: unknown) => post<{ aprovado: boolean }>(`/frascos-pasteurizados/${frascoId}/analise`, dados);

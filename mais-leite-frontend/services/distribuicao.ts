import { api, post, put } from "./api";
import type { Alocacao, Devolucao, Distribuicao, FichaDistribuicao } from "@/types/distribuicao";

export const listarAlocacoes = () => api<Alocacao[]>("/alocacoes");
export const alocarFrasco = (dados: unknown) => post("/alocacoes", dados);
export const registrarAdministracao = (alocacaoId: number, dados: unknown) => put(`/alocacoes/${alocacaoId}/administracao`, dados);

export const listarDistribuicoes = () => api<Distribuicao[]>("/distribuicoes");
export const buscarFicha = (id: number) => api<FichaDistribuicao>(`/distribuicoes/${id}`);
export const criarDistribuicao = (dados: unknown) => post("/distribuicoes", dados);

export const listarDevolucoes = () => api<Devolucao[]>("/devolucoes");
export const criarDevolucao = (dados: unknown) => post("/devolucoes", dados);

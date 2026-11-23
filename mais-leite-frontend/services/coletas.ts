import { api, post, put } from "./api";
import type { FrascoCru, Recepcao, Visita } from "@/types/coleta";

export const listarVisitas = () => api<Visita[]>("/coletas");
export const agendarVisita = (dados: unknown) => post("/coletas/agendar", dados);
export const realizarVisita = (id: number, dados: unknown) => put(`/coletas/${id}/realizar`, dados);
export const cancelarVisita = (id: number) => put(`/coletas/${id}/cancelar`, {});

export const listarFrascosCrus = (status?: string) => api<FrascoCru[]>(status ? `/frascos-crus?status=${status}` : "/frascos-crus");
export const criarFrascoCru = (visitaId: number, dados: unknown) => post(`/coletas/${visitaId}/frascos`, dados);

export const listarRecepcoes = () => api<Recepcao[]>("/recepcoes");
export const criarRecepcao = (dados: unknown) => post("/recepcoes", dados);

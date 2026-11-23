import { api, post, put } from "./api";
import type { Doadora, DoadoraDetalhe, Zona } from "@/types/doadora";

export const listarZonas = () => api<Zona[]>("/zonas");
export const listarDoadoras = () => api<Doadora[]>("/doadoras");
export const buscarDoadora = (id: number) => api<DoadoraDetalhe>(`/doadoras/${id}`);

export const criarDoadora = (dados: unknown) => post<DoadoraDetalhe>("/doadoras", dados);
export const editarDoadora = (id: number, dados: unknown) => put<DoadoraDetalhe>(`/doadoras/${id}`, dados);
export const registrarTriagem = (id: number, dados: unknown) => post<DoadoraDetalhe>(`/doadoras/${id}/triagem`, dados);
export const registrarSorologia = (id: number, dados: unknown) => post<DoadoraDetalhe>(`/doadoras/${id}/sorologias`, dados);

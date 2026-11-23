import { api, post } from "./api";
import type { Demanda, Hospital, Prescricao } from "@/types/hospital";

export const listarHospitais = () => api<Hospital[]>("/hospitais");
export const criarHospital = (dados: unknown) => post("/hospitais", dados);

export const listarDemandas = () => api<Demanda[]>("/demandas");
export const criarDemanda = (dados: unknown) => post("/demandas", dados);

export const listarPrescricoes = () => api<Prescricao[]>("/prescricoes");
export const criarPrescricao = (demandaId: number, dados: unknown) => post(`/demandas/${demandaId}/prescricoes`, dados);

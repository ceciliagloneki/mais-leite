import { useQuery } from "@tanstack/react-query";
import { criarDemanda, criarHospital, criarPrescricao, listarDemandas, listarHospitais, listarPrescricoes } from "@/services/hospitais";
import type { DadosFormulario } from "@/lib/form";
import { useSalvar } from "./use-salvar";

export const useHospitais = () => useQuery({ queryKey: ["hospitais"], queryFn: listarHospitais });
export const useDemandas = () => useQuery({ queryKey: ["demandas"], queryFn: listarDemandas });
export const usePrescricoes = () => useQuery({ queryKey: ["prescricoes"], queryFn: listarPrescricoes });

export const useCriarHospital = () => useSalvar(criarHospital);
export const useCriarDemanda = () => useSalvar(criarDemanda);
export const useCriarPrescricao = () => useSalvar((dados: DadosFormulario) => criarPrescricao(Number(dados.demanda_id), dados));

import { useQuery } from "@tanstack/react-query";
import {
  alocarFrasco,
  buscarFicha,
  criarDevolucao,
  criarDistribuicao,
  listarAlocacoes,
  listarDevolucoes,
  listarDistribuicoes,
  registrarAdministracao,
} from "@/services/distribuicao";
import type { DadosFormulario } from "@/lib/form";
import { useSalvar } from "./use-salvar";

export const useAlocacoes = () => useQuery({ queryKey: ["alocacoes"], queryFn: listarAlocacoes });
export const useDistribuicoes = () => useQuery({ queryKey: ["distribuicoes"], queryFn: listarDistribuicoes });
export const useFicha = (id: number | null) => useQuery({ queryKey: ["distribuicoes", id], queryFn: () => buscarFicha(id!), enabled: id !== null });
export const useDevolucoes = () => useQuery({ queryKey: ["devolucoes"], queryFn: listarDevolucoes });

export const useAlocarFrasco = () => useSalvar(alocarFrasco);
export const useCriarDistribuicao = () => useSalvar(criarDistribuicao);
export const useRegistrarAdministracao = () => useSalvar((dados: DadosFormulario) => registrarAdministracao(Number(dados.alocacao_id), dados));
export const useCriarDevolucao = () => useSalvar(criarDevolucao);

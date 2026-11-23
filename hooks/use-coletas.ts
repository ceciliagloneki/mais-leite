import { useQuery } from "@tanstack/react-query";
import {
  agendarVisita,
  cancelarVisita,
  criarFrascoCru,
  criarRecepcao,
  listarFrascosCrus,
  listarRecepcoes,
  listarVisitas,
  realizarVisita,
} from "@/services/coletas";
import type { DadosFormulario } from "@/lib/form";
import { useSalvar } from "./use-salvar";

export const useVisitas = () => useQuery({ queryKey: ["visitas"], queryFn: listarVisitas });
export const useFrascosCrus = (status?: string) => useQuery({ queryKey: ["frascos-crus", status], queryFn: () => listarFrascosCrus(status) });
export const useRecepcoes = () => useQuery({ queryKey: ["recepcoes"], queryFn: listarRecepcoes });

export const useAgendarVisita = () => useSalvar(agendarVisita);
export const useRealizarVisita = (id: number) => useSalvar((dados: unknown) => realizarVisita(id, dados));
export const useCancelarVisita = () => useSalvar(cancelarVisita);
export const useCriarFrascoCru = () => useSalvar((dados: DadosFormulario) => criarFrascoCru(Number(dados.visita_coleta_id), dados));
export const useCriarRecepcao = () => useSalvar(criarRecepcao);

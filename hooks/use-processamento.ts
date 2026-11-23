import { useQuery } from "@tanstack/react-query";
import { criarPasteurizacao, listarFrascosPasteurizados, listarPasteurizacoes, reenvasar, registrarAnalise } from "@/services/processamento";
import type { DadosFormulario } from "@/lib/form";
import { useSalvar } from "./use-salvar";

export const usePasteurizacoes = () => useQuery({ queryKey: ["pasteurizacoes"], queryFn: listarPasteurizacoes });
export const useFrascosPasteurizados = (status?: string) =>
  useQuery({ queryKey: ["frascos-pasteurizados", status], queryFn: () => listarFrascosPasteurizados(status) });

export const useCriarPasteurizacao = () => useSalvar(criarPasteurizacao);
export const useReenvasar = () => useSalvar((dados: DadosFormulario) => reenvasar(Number(dados.pasteurizacao_id), dados));
export const useRegistrarAnalise = () => useSalvar((dados: DadosFormulario) => registrarAnalise(Number(dados.frasco_pasteurizado_id), dados));

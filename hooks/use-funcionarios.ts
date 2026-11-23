import { useQuery } from "@tanstack/react-query";
import { criarFuncionario, inativarFuncionario, listarFuncionarios } from "@/services/funcionarios";
import { useSalvar } from "./use-salvar";

export const useFuncionarios = () => useQuery({ queryKey: ["funcionarios"], queryFn: listarFuncionarios });
export const useCriarFuncionario = () => useSalvar(criarFuncionario);
export const useInativarFuncionario = () => useSalvar(inativarFuncionario);

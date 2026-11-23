import { useQuery } from "@tanstack/react-query";
import { buscarDoadora, criarDoadora, editarDoadora, listarDoadoras, listarZonas, registrarSorologia, registrarTriagem } from "@/services/doadoras";
import { useSalvar } from "./use-salvar";

export const useZonas = () => useQuery({ queryKey: ["zonas"], queryFn: listarZonas });
export const useDoadoras = () => useQuery({ queryKey: ["doadoras"], queryFn: listarDoadoras });
export const useDoadora = (id: number) => useQuery({ queryKey: ["doadoras", id], queryFn: () => buscarDoadora(id) });

export const useCriarDoadora = () => useSalvar(criarDoadora);
export const useEditarDoadora = (id: number) => useSalvar((dados: unknown) => editarDoadora(id, dados));
export const useRegistrarTriagem = (id: number) => useSalvar((dados: unknown) => registrarTriagem(id, dados));
export const useRegistrarSorologia = (id: number) => useSalvar((dados: unknown) => registrarSorologia(id, dados));

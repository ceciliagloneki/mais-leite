import { api, post } from "./api";
import type { Funcionario } from "@/types/funcionario";

export const listarFuncionarios = () => api<Funcionario[]>("/funcionarios");
export const criarFuncionario = (dados: unknown) => post("/funcionarios", dados);
export const inativarFuncionario = (id: number) => api(`/funcionarios/${id}`, { method: "DELETE" });

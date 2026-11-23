import { useQuery } from "@tanstack/react-query";
import { buscarDashboard } from "@/services/relatorios";

export const useDashboard = () => useQuery({ queryKey: ["dashboard"], queryFn: buscarDashboard });

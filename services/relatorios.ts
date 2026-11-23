import { api } from "./api";
import type { Dashboard } from "@/types/relatorio";

export const buscarDashboard = () => api<Dashboard>("/dashboard");

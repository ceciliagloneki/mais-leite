import type { ReactNode } from "react";

import { Sidebar } from "@/components/Sidebar";

// Layout compartilhado por todas as páginas do grupo (dashboard).
// Mantém o Sidebar fixo à esquerda e reserva o espaço (pl-64) para o conteúdo.
// Qualquer página criada dentro de app/(dashboard)/ herda este layout
// automaticamente, garantindo visual padronizado entre as áreas do sistema.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <div className="min-h-screen">{children}</div>
      </div>
    </div>
  );
}

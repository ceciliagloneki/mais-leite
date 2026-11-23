"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificacaoProvider } from "@/components/Notificacao";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <NotificacaoProvider>{children}</NotificacaoProvider>
    </QueryClientProvider>
  );
}

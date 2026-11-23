"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, X } from "lucide-react";

type Notificar = (mensagem: string) => void;

const NotificacaoContext = createContext<Notificar>(() => {});

export function NotificacaoProvider({ children }: { children: ReactNode }) {
  const [mensagem, setMensagem] = useState<{ texto: string; id: number } | null>(null);

  const notificar = useCallback<Notificar>((texto) => {
    const id = Date.now();
    setMensagem({ texto, id });
    setTimeout(() => setMensagem((atual) => (atual?.id === id ? null : atual)), 5000);
  }, []);

  return (
    <NotificacaoContext.Provider value={notificar}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 print:hidden">
        {mensagem ? (
          <div
            role="status"
            className="pointer-events-auto flex max-w-lg items-center gap-3 rounded-xl bg-success px-5 py-4 text-base font-medium text-white shadow-lg"
          >
            <CheckCircle2 className="h-6 w-6 shrink-0" aria-hidden="true" />
            <span className="flex-1">{mensagem.texto}</span>
            <button type="button" onClick={() => setMensagem(null)} aria-label="Fechar aviso" className="rounded p-1 hover:bg-white/15">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </NotificacaoContext.Provider>
  );
}

export function useNotificacao(): Notificar {
  return useContext(NotificacaoContext);
}

export default NotificacaoProvider;

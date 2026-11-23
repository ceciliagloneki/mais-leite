"use client";

import type { LucideIcon } from "lucide-react";

export interface Aba<T extends string> {
  id: T;
  titulo: string;
  icone?: LucideIcon;
  contador?: number;
}

interface AbasProps<T extends string> {
  abas: Aba<T>[];
  ativa: T;
  onTrocar: (id: T) => void;
}

export function Abas<T extends string>({ abas, ativa, onTrocar }: AbasProps<T>) {
  return (
    <div
      role="tablist"
      className="flex gap-1 overflow-x-auto overflow-y-hidden shadow-[inset_0_-2px_0_hsl(var(--border))] [scrollbar-width:none] print:hidden [&::-webkit-scrollbar]:hidden"
    >
      {abas.map((aba) => {
        const selecionada = aba.id === ativa;
        const Icone = aba.icone;
        return (
          <button
            key={aba.id}
            type="button"
            role="tab"
            aria-selected={selecionada}
            onClick={() => onTrocar(aba.id)}
            className={`flex shrink-0 items-center gap-2 border-b-[3px] px-4 py-2.5 text-sm font-medium transition-colors ${
              selecionada ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:border-input hover:text-foreground"
            }`}
          >
            {Icone ? <Icone className="h-4 w-4" aria-hidden="true" /> : null}
            {aba.titulo}
            {aba.contador ? (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${selecionada ? "bg-primary text-primary-foreground" : "bg-warning/15 text-warning"}`}
              >
                {aba.contador}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export default Abas;

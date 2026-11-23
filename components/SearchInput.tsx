"use client";

import { Search, X } from "lucide-react";

interface BuscaProps {
  valor: string;
  onMudar: (valor: string) => void;
  placeholder?: string;
}

export function Busca({ valor, onMudar, placeholder = "Buscar…" }: BuscaProps) {
  return (
    <div className="relative w-full sm:max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input
        type="search"
        value={valor}
        onChange={(e) => onMudar(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-lg border border-input bg-surface pl-9 pr-10 text-sm placeholder:text-muted-foreground/80 [&::-webkit-search-cancel-button]:hidden"
      />
      {valor ? (
        <button
          type="button"
          onClick={() => onMudar("")}
          aria-label="Limpar busca"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

export default Busca;

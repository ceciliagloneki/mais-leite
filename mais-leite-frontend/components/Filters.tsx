"use client";

import { ChevronDown, ChevronRight } from "lucide-react";

interface OpcaoFiltro {
  valor: string;
  texto: string;
  total?: number;
}

interface FiltrosProps {
  opcoes: OpcaoFiltro[];
  ativo: string;
  onTrocar: (valor: string) => void;
}

export function Filtros({ opcoes, ativo, onTrocar }: FiltrosProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar lista">
      {opcoes.map((opcao) => {
        const selecionado = opcao.valor === ativo;
        return (
          <button
            key={opcao.valor}
            type="button"
            aria-pressed={selecionado}
            onClick={() => onTrocar(opcao.valor)}
            className={`flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors ${
              selecionado ? "border-primary bg-primary text-primary-foreground" : "border-input bg-surface text-foreground hover:bg-muted"
            }`}
          >
            {opcao.texto}
            {opcao.total !== undefined ? (
              <span className={`text-xs ${selecionado ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{opcao.total}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

interface FiltroSelecaoProps {
  rotulo: string;
  valor: string;
  onMudar: (valor: string) => void;
  opcoes: { valor: string; texto: string }[];
}

export function FiltroSelecao({ rotulo, valor, onMudar, opcoes }: FiltroSelecaoProps) {
  return (
    <span className="relative block w-full sm:w-auto">
      <select
        value={valor}
        onChange={(e) => onMudar(e.target.value)}
        aria-label={rotulo}
        className="h-10 w-full appearance-none rounded-lg border border-input bg-surface pl-3 pr-9 text-sm text-foreground sm:w-48"
      >
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
    </span>
  );
}

interface EtapaResumo {
  valor: string;
  texto: string;
  total: number;
  tom?: "padrao" | "perigo";
  separada?: boolean;
}

export function FiltrosEtapas({ etapas, ativo, onTrocar }: { etapas: EtapaResumo[]; ativo: string; onTrocar: (valor: string) => void }) {
  const sequencia = etapas.filter((e) => !e.separada);
  const separadas = etapas.filter((e) => e.separada);

  const botao = (e: EtapaResumo) => {
    const selecionado = e.valor === ativo;
    return (
      <button
        key={e.valor}
        type="button"
        aria-pressed={selecionado}
        onClick={() => onTrocar(selecionado ? etapas[0].valor : e.valor)}
        className={`flex min-w-0 flex-1 flex-col items-start rounded-lg border px-4 py-3 text-left transition-colors ${
          selecionado ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-surface hover:border-primary/40 hover:bg-muted/40"
        }`}
      >
        <span
          className={`text-2xl font-bold leading-none tabular-nums ${e.tom === "perigo" ? "text-danger" : selecionado ? "text-primary" : "text-foreground"}`}
        >
          {e.total}
        </span>
        <span className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{e.texto}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-2 lg:flex-row" role="group" aria-label="Filtrar por etapa">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {sequencia.map((e, i) => (
          <div key={e.valor} className="flex min-w-0 flex-1 items-center gap-2">
            {i > 0 ? <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" aria-hidden="true" /> : null}
            {botao(e)}
          </div>
        ))}
      </div>
      {separadas.length ? <div className="flex gap-2 lg:w-48 lg:border-l lg:border-border lg:pl-2">{separadas.map(botao)}</div> : null}
    </div>
  );
}

export default Filtros;

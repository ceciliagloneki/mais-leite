import type { ReactNode } from "react";

export function PassoLinhaDoTempo({
  numero,
  titulo,
  descricao,
  ultima,
  pendente,
  children,
}: {
  numero: number;
  titulo: string;
  descricao?: string;
  ultima?: boolean;
  pendente?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="flex gap-4">
      <div className="flex flex-col items-center">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            pendente ? "border-2 border-border bg-surface text-muted-foreground" : "bg-primary text-primary-foreground"
          }`}
        >
          {numero}
        </span>
        {!ultima ? <span className="my-2 w-0.5 flex-1 rounded-full bg-border" aria-hidden="true" /> : null}
      </div>
      <div className={`min-w-0 flex-1 ${ultima ? "" : "pb-7"}`}>
        <div className="mb-4 flex min-h-8 flex-col justify-center">
          <h3 className="text-base font-semibold leading-tight text-foreground">
            <span className="mr-2 text-xs font-bold uppercase tracking-wider text-primary">Etapa {numero}</span>
            {titulo}
          </h3>
          {descricao ? <p className="mt-0.5 text-sm text-muted-foreground">{descricao}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export type EstadoPasso = "feito" | "atual" | "falhou" | "pendente";

export interface PassoProgresso {
  rotulo: string;
  estado: EstadoPasso;
}

const COR_PASSO: Record<EstadoPasso, string> = {
  feito: "border-success bg-success text-white",
  atual: "border-warning bg-warning/15 text-warning",
  falhou: "border-danger bg-danger text-white",
  pendente: "border-border bg-surface text-muted-foreground",
};

const COR_LIGACAO: Record<EstadoPasso, string> = {
  feito: "bg-success",
  atual: "bg-warning/50",
  falhou: "bg-danger",
  pendente: "bg-border",
};

export function ProgressoEtapas({ passos, compacto }: { passos: PassoProgresso[]; compacto?: boolean }) {
  if (compacto) {
    return (
      <span className="flex items-center" aria-label={passos.map((p) => `${p.rotulo}: ${p.estado}`).join(", ")}>
        {passos.map((p, i) => (
          <span key={p.rotulo} className="flex items-center" title={p.rotulo}>
            {i > 0 ? <span className={`h-0.5 w-3 ${COR_LIGACAO[p.estado]}`} /> : null}
            <span className={`h-3 w-3 rounded-full border-2 ${COR_PASSO[p.estado]} ${p.estado === "atual" ? "ring-2 ring-warning/30" : ""}`} />
          </span>
        ))}
      </span>
    );
  }

  return (
    <ol className="flex w-full items-start">
      {passos.map((p, i) => (
        <li key={p.rotulo} className="relative flex flex-1 flex-col items-center gap-1.5 text-center">
          {i > 0 ? <span className={`absolute right-1/2 top-3.5 h-0.5 w-full -translate-y-1/2 ${COR_LIGACAO[p.estado]}`} aria-hidden="true" /> : null}
          <span className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold ${COR_PASSO[p.estado]}`}>
            {p.estado === "feito" ? "✓" : p.estado === "falhou" ? "✕" : i + 1}
          </span>
          <span className={`text-xs font-semibold leading-tight ${p.estado === "pendente" ? "text-muted-foreground" : "text-foreground"}`}>{p.rotulo}</span>
        </li>
      ))}
    </ol>
  );
}

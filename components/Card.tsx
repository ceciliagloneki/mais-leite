import type { ReactNode } from "react";

interface CardProps {
  titulo?: ReactNode;
  descricao?: ReactNode;
  acao?: ReactNode;
  tabela?: boolean;
  filtros?: ReactNode;
  children: ReactNode;
}

export function Card({ titulo, descricao, acao, tabela, filtros, children }: CardProps) {
  const temCabecalho = titulo || descricao || acao;

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm print:hidden">
      {temCabecalho ? (
        <div className={`flex flex-wrap items-start justify-between gap-3 px-5 pt-4 ${tabela ? "pb-3" : ""}`}>
          <div>
            {titulo ? <h2 className="text-xl font-semibold leading-tight text-foreground">{titulo}</h2> : null}
            {descricao ? <p className="mt-0.5 text-sm text-muted-foreground">{descricao}</p> : null}
          </div>
          {acao}
        </div>
      ) : null}
      {filtros ? (
        <div className={`flex flex-col gap-3 border-border px-4 py-3 lg:flex-row lg:flex-wrap lg:items-center ${temCabecalho ? "border-t" : ""}`}>
          {filtros}
        </div>
      ) : null}
      <div className={tabela ? "" : temCabecalho ? "px-5 pb-5 pt-3" : "p-5"}>{children}</div>
    </section>
  );
}

export default Card;

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, type LucideIcon } from "lucide-react";

type Tom = "padrao" | "sucesso" | "alerta" | "perigo";

const ICONE: Record<Tom, string> = {
  padrao: "bg-primary/10 text-primary",
  sucesso: "bg-success/10 text-success",
  alerta: "bg-warning/10 text-warning",
  perigo: "bg-danger/10 text-danger",
};

const BARRA: Record<Tom, string> = {
  padrao: "before:bg-primary",
  sucesso: "before:bg-success",
  alerta: "before:bg-warning",
  perigo: "before:bg-danger",
};

interface IndicadorProps {
  titulo: string;
  valor: ReactNode;
  unidade?: string;
  complemento?: ReactNode;
  icone: LucideIcon;
  tom?: Tom;
  descricao?: string;
  href?: string;
  onClick?: () => void;
  acao?: string;
}

export function Indicador({ titulo, valor, unidade, complemento, icone: Icone, tom = "padrao", descricao, href, onClick, acao }: IndicadorProps) {
  const clicavel = Boolean(href || onClick);
  const conteudo = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{titulo}</p>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${ICONE[tom]}`}>
          <Icone className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
        <span className="text-3xl font-bold leading-none tabular-nums text-foreground">{valor}</span>
        {unidade ? <span className="text-sm font-medium text-muted-foreground">{unidade}</span> : null}
        {complemento ? <span className="text-sm font-semibold tabular-nums text-foreground">· {complemento}</span> : null}
      </p>
      {descricao ? <p className="mt-2 text-sm leading-snug text-muted-foreground">{descricao}</p> : null}
      {clicavel && acao ? (
        <span className="mt-auto flex items-center gap-1.5 pt-3 text-sm font-semibold text-primary">
          {acao}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      ) : null}
    </>
  );

  const classe = `group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface p-4 pl-5 text-left shadow-sm before:absolute before:inset-y-0 before:left-0 before:w-1 ${BARRA[tom]}`;
  const interativo = "transition hover:border-primary/40 hover:shadow-md";

  if (href) {
    return (
      <Link href={href} className={`${classe} ${interativo}`}>
        {conteudo}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${classe} ${interativo}`}>
        {conteudo}
      </button>
    );
  }
  return <div className={classe}>{conteudo}</div>;
}

export default Indicador;

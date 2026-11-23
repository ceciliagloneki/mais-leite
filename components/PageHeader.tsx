import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  titulo: ReactNode;
  descricao?: ReactNode;
  acao?: ReactNode;
  voltar?: { href: string; texto: string };
}

export function PageHeader({ titulo, descricao, acao, voltar }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 print:hidden">
      {voltar ? (
        <Link
          href={voltar.href}
          className="-ml-1.5 mb-4 inline-flex w-fit items-center gap-1 rounded-md py-0.5 text-sm font-medium text-primary hover:underline"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          {voltar.texto}
        </Link>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">{titulo}</h1>
          {descricao ? <p className="text-sm text-muted-foreground">{descricao}</p> : null}
        </div>
        {acao ? <div className="flex shrink-0 flex-wrap gap-3">{acao}</div> : null}
      </div>
    </header>
  );
}

export default PageHeader;

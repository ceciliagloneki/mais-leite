"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Inbox, LoaderCircle } from "lucide-react";

export interface Coluna<T> {
  titulo: string;
  valor: (item: T) => ReactNode;
  direita?: boolean;
}

interface DataTableProps<T> {
  colunas: Coluna<T>[];
  itens: T[] | undefined;
  carregando?: boolean;
  erro?: Error | null;
  vazio?: string;
  aoClicar?: (item: T) => void;
  porPagina?: number;
  destacar?: (item: T) => boolean;
}

export function DataTable<T>({
  colunas,
  itens,
  carregando,
  erro,
  vazio = "Nenhum registro encontrado.",
  aoClicar,
  porPagina = 10,
  destacar,
}: DataTableProps<T>) {
  const [pagina, setPagina] = useState(1);
  const total = itens?.length ?? 0;
  const paginas = Math.max(1, Math.ceil(total / porPagina));

  useEffect(() => setPagina(1), [total]);

  if (carregando) {
    return <Estado icone={<LoaderCircle className="h-7 w-7 animate-spin" />} texto="Carregando…" />;
  }
  if (erro) {
    return <Estado icone={<AlertCircle className="h-7 w-7 text-danger" />} texto={erro.message} perigo />;
  }
  if (!itens || itens.length === 0) {
    return <Estado icone={<Inbox className="h-7 w-7" />} texto={vazio} />;
  }

  const atual = Math.min(pagina, paginas);
  const inicio = (atual - 1) * porPagina;
  const visiveis = itens.slice(inicio, inicio + porPagina);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm leading-snug">
          <thead className="border-y border-border bg-muted/60">
            <tr>
              {colunas.map((coluna, indice) => (
                <th
                  key={`${coluna.titulo}-${indice}`}
                  scope="col"
                  className={`h-10 whitespace-nowrap px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${coluna.direita ? "text-right" : ""}`}
                >
                  {coluna.titulo}
                </th>
              ))}
              {aoClicar ? <th aria-hidden="true" className="h-10 w-10" /> : null}
            </tr>
          </thead>
          <tbody>
            {visiveis.map((item, indice) => (
              <tr
                key={indice}
                onClick={aoClicar ? () => aoClicar(item) : undefined}
                aria-current={destacar?.(item) ? "true" : undefined}
                className={`border-b border-border last:border-0 ${
                  destacar?.(item)
                    ? "bg-primary/10 shadow-[inset_4px_0_0_hsl(var(--primary))]"
                    : aoClicar
                      ? "cursor-pointer hover:bg-primary/5"
                      : "hover:bg-muted/40"
                }`}
              >
                {colunas.map((coluna, i) => (
                  <td
                    key={`${coluna.titulo}-${i}`}
                    className={`h-14 px-4 py-2 align-middle text-sm text-foreground ${coluna.direita ? "whitespace-nowrap text-right" : ""}`}
                  >
                    {coluna.valor(item)}
                  </td>
                ))}
                {aoClicar ? (
                  <td className="h-14 w-10 pr-4 text-right align-middle">
                    {destacar?.(item) ? null : <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2 text-xs text-muted-foreground">
        <span>{total === 1 ? "1 registro" : `${inicio + 1}–${inicio + visiveis.length} de ${total} registros`}</span>
        <Paginacao atual={atual} paginas={paginas} onIr={setPagina} />
      </div>
    </div>
  );
}

function Paginacao({ atual, paginas, onIr, limite = 5 }: { atual: number; paginas: number; onIr: (pagina: number) => void; limite?: number }) {
  const janela = Math.max(1, limite - 2);
  let inicio = Math.max(2, atual - Math.floor((janela - 1) / 2));
  const fim = Math.min(paginas - 1, inicio + janela - 1);
  inicio = Math.max(2, fim - janela + 1);
  const numeros =
    paginas <= limite ? Array.from({ length: paginas }, (_, i) => i + 1) : [1, ...Array.from({ length: fim - inicio + 1 }, (_, i) => inicio + i), paginas];
  const botao =
    "flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav className="flex items-center gap-1" aria-label="Paginação">
      <button
        type="button"
        onClick={() => onIr(atual - 1)}
        disabled={atual === 1}
        aria-label="Página anterior"
        className={`${botao} border-input bg-surface text-foreground hover:bg-muted`}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>
      {numeros.map((n, i) => (
        <span key={n} className="flex items-center gap-1">
          {i > 0 && n - numeros[i - 1] > 1 ? (
            <span className="px-1" aria-hidden="true">
              …
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => onIr(n)}
            aria-current={n === atual ? "page" : undefined}
            className={`${botao} ${n === atual ? "border-primary bg-primary text-primary-foreground" : "border-input bg-surface text-foreground hover:bg-muted"}`}
          >
            {n}
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={() => onIr(atual + 1)}
        disabled={atual === paginas}
        aria-label="Próxima página"
        className={`${botao} border-input bg-surface text-foreground hover:bg-muted`}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}

function Estado({ icone, texto, perigo }: { icone: ReactNode; texto: string; perigo?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 border-t border-border px-6 py-10 text-center text-sm ${perigo ? "text-danger" : "text-muted-foreground"}`}
    >
      {icone}
      <p>{texto}</p>
    </div>
  );
}

export function Codigo({ children }: { children: ReactNode }) {
  return <span className="font-mono font-bold text-primary">{children}</span>;
}

export function Numero({ children, forte }: { children: ReactNode; forte?: boolean }) {
  return <span className={`whitespace-nowrap tabular-nums ${forte ? "font-semibold" : ""}`}>{children}</span>;
}

export function TextoDuplo({ principal, secundario, apagado }: { principal: ReactNode; secundario?: ReactNode; apagado?: boolean }) {
  return (
    <span className="flex min-w-0 flex-col">
      <span className={`font-semibold ${apagado ? "text-muted-foreground" : "text-foreground"}`}>{principal}</span>
      {secundario ? <span className="text-xs text-muted-foreground">{secundario}</span> : null}
    </span>
  );
}

export function TextoApoio({ children }: { children: ReactNode }) {
  return <span className="text-muted-foreground">{children || "—"}</span>;
}

export default DataTable;

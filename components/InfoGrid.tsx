import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

const ROTULO = "text-xs font-medium uppercase tracking-wide text-muted-foreground";
const VALOR = "text-sm font-semibold text-foreground";
const TITULO_BLOCO = "flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-primary";

function IconeTitulo({ icone: Icone }: { icone: LucideIcon }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
      <Icone className="h-4 w-4" aria-hidden="true" />
    </span>
  );
}

export function GradeBlocos({ children, colunas = 3 }: { children: ReactNode; colunas?: 2 | 3 }) {
  return (
    <section
      className={`grid overflow-hidden rounded-xl border border-border bg-surface shadow-sm md:divide-x md:divide-border max-md:divide-y max-md:divide-border ${
        colunas === 3 ? "md:grid-cols-3" : "md:grid-cols-2"
      }`}
    >
      {children}
    </section>
  );
}

export function BlocoInfo({ icone, titulo, acao, children }: { icone: LucideIcon; titulo: string; acao?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 px-5 py-4">
      <div className="flex min-h-7 items-center justify-between gap-2">
        <h3 className={TITULO_BLOCO}>
          <IconeTitulo icone={icone} />
          {titulo}
        </h3>
        {acao}
      </div>
      <dl className="grid grid-cols-2 gap-x-5 gap-y-3">{children}</dl>
    </div>
  );
}

export function ItemInfo({ rotulo, valor, largo, numerico }: { rotulo: string; valor: ReactNode; largo?: boolean; numerico?: boolean }) {
  return (
    <div className={`min-w-0 ${largo ? "col-span-2" : ""}`}>
      <dt className={ROTULO}>{rotulo}</dt>
      <dd className={`mt-0.5 break-words ${VALOR} ${numerico ? "tabular-nums" : ""}`}>{valor ?? "—"}</dd>
    </div>
  );
}

export function FaixaNumeros({ itens }: { itens: { rotulo: string; valor: ReactNode; detalhe?: string; tom?: "padrao" | "destaque" }[] }) {
  return (
    <dl
      className={`grid divide-border overflow-hidden rounded-xl border border-border bg-surface sm:divide-x max-sm:divide-y ${itens.length === 4 ? "sm:grid-cols-4" : itens.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}
    >
      {itens.map((item) => (
        <div key={item.rotulo} className="flex flex-col gap-1 px-5 py-4">
          <dt className={ROTULO}>{item.rotulo}</dt>
          <dd className={`text-3xl font-bold leading-none tabular-nums ${item.tom === "destaque" ? "text-primary" : "text-foreground"}`}>{item.valor}</dd>
          {item.detalhe ? <dd className="text-sm text-muted-foreground">{item.detalhe}</dd> : null}
        </div>
      ))}
    </dl>
  );
}

export function SecaoInfo({ titulo, descricao, acao, children }: { titulo: string; descricao?: string; acao?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border pb-2">
        <div>
          <h3 className="text-base font-semibold text-foreground">{titulo}</h3>
          {descricao ? <p className="text-sm text-muted-foreground">{descricao}</p> : null}
        </div>
        {acao}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

export function PainelInfo({ icone, titulo, classe = "", children }: { icone: LucideIcon; titulo: string; classe?: string; children: ReactNode }) {
  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border border-border bg-surface ${classe}`}>
      <h4 className={`border-b border-border bg-muted/40 px-4 py-2.5 ${TITULO_BLOCO}`}>
        <IconeTitulo icone={icone} />
        {titulo}
      </h4>
      <dl className="flex-1 divide-y divide-border px-4">{children}</dl>
    </div>
  );
}

export function LinhaInfo({ rotulo, valor, alerta }: { rotulo: string; valor: ReactNode; alerta?: boolean }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4 py-2">
      <dt className="text-sm text-muted-foreground">{rotulo}</dt>
      <dd className={`flex items-center gap-1.5 text-right text-sm font-semibold ${alerta ? "text-warning" : "text-foreground"}`}>
        {alerta ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" /> : null}
        {valor}
      </dd>
    </div>
  );
}

export function Dados({ children }: { children: ReactNode }) {
  return <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">{children}</dl>;
}

export function Dado({ rotulo, valor, largo }: { rotulo: string; valor: ReactNode; largo?: boolean }) {
  return (
    <div className={largo ? "sm:col-span-2 xl:col-span-4" : ""}>
      <dt className={ROTULO}>{rotulo}</dt>
      <dd className={`mt-0.5 ${VALOR}`}>{valor ?? "—"}</dd>
    </div>
  );
}

export function DadoDestaque({ rotulo, valor, alerta }: { rotulo: string; valor: ReactNode; alerta?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg px-4 py-3 ${alerta ? "bg-warning/10" : "bg-muted/70"}`}>
      <span className="text-sm text-foreground">{rotulo}</span>
      <span className={`text-sm font-semibold ${alerta ? "text-warning" : "text-primary"}`}>{valor}</span>
    </div>
  );
}

export default Dados;

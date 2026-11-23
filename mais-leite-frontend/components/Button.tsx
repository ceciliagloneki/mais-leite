import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

export type VarianteBotao = "primario" | "secundario" | "perigo" | "texto";

const VARIANTES: Record<VarianteBotao, string> = {
  primario: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
  secundario: "border border-input bg-surface text-foreground hover:bg-muted",
  perigo: "border border-danger/40 bg-surface text-danger hover:bg-danger/10",
  texto: "text-primary underline-offset-4 hover:underline",
};

export function classeBotao(variante: VarianteBotao = "primario", pequeno = false): string {
  const tamanho = variante === "texto" ? "px-1" : pequeno ? "h-10 px-4 text-sm" : "h-12 px-5 text-base";
  return `inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${tamanho} ${VARIANTES[variante]}`;
}

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBotao;
  icone?: LucideIcon;
  pequeno?: boolean;
}

export function Botao({ variante = "primario", icone: Icone, pequeno, className = "", type = "button", children, ...props }: BotaoProps) {
  return (
    <button type={type} className={`${classeBotao(variante, pequeno)} ${className}`} {...props}>
      {Icone ? <Icone className={pequeno ? "h-4 w-4" : "h-5 w-5"} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export default Botao;

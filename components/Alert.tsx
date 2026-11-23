import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

type Tom = "info" | "sucesso" | "alerta" | "perigo";

const ESTILO: Record<Tom, { classe: string; icone: typeof Info }> = {
  info: { classe: "border-info/25 bg-info/5 text-info", icone: Info },
  sucesso: { classe: "border-success/25 bg-success/10 text-success", icone: CheckCircle2 },
  alerta: { classe: "border-warning/30 bg-warning/10 text-warning", icone: AlertTriangle },
  perigo: { classe: "border-danger/30 bg-danger/10 text-danger", icone: XCircle },
};

interface AvisoProps {
  tom?: Tom;
  titulo?: string;
  children?: ReactNode;
  acao?: ReactNode;
}

export function Aviso({ tom = "info", titulo, children, acao }: AvisoProps) {
  const { classe, icone: Icone } = ESTILO[tom];

  return (
    <div role={tom === "perigo" ? "alert" : undefined} className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center ${classe}`}>
      <div className="flex flex-1 items-center gap-4">
        <Icone className="h-6 w-6 shrink-0" aria-hidden="true" />
        <div className="text-base">
          {titulo ? <p className="font-semibold">{titulo}</p> : null}
          {children ? <div className="text-foreground/85">{children}</div> : null}
        </div>
      </div>
      {acao}
    </div>
  );
}

export default Aviso;

import { rotulo } from "@/lib/format";

type Tom = "sucesso" | "alerta" | "info" | "perigo" | "neutro";

const TONS: Record<Tom, string> = {
  sucesso: "border-success/25 bg-success/10 text-success",
  alerta: "border-warning/25 bg-warning/10 text-warning",
  info: "border-info/25 bg-info/10 text-info",
  perigo: "border-danger/25 bg-danger/10 text-danger",
  neutro: "border-border bg-muted text-muted-foreground",
};

const STATUS: Record<string, Tom> = {
  ativo: "sucesso",
  ativa: "sucesso",
  normal: "sucesso",
  conforme: "sucesso",
  disponivel: "sucesso",
  atendida: "sucesso",
  distribuido: "sucesso",
  realizada: "sucesso",
  negativo: "sucesso",
  em_triagem: "alerta",
  coletado: "alerta",
  quarentena: "alerta",
  pendente: "alerta",
  agendada: "info",
  alocado: "info",
  pasteurizado: "info",
  removida: "perigo",
  alterado: "perigo",
  inapta: "perigo",
  descartado: "perigo",
  reprovado: "perigo",
  bloqueado: "perigo",
  positivo: "perigo",
  inativo: "neutro",
  cancelada: "neutro",
};

interface StatusBadgeProps {
  status: string;
  texto?: string;
}

export function StatusBadge({ status, texto }: StatusBadgeProps) {
  const tom = STATUS[status] ?? "neutro";

  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TONS[tom]}`}>
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
      {texto ?? rotulo(status)}
    </span>
  );
}

export default StatusBadge;

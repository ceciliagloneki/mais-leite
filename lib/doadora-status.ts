import type { Doadora_Status } from "@/types/doadora";

export type Color_State = "success" | "warning" | "danger" | "primary" | "neutral";

export function statusColorState(status: Doadora_Status): Color_State {
  switch (status) {
    case "Ativa":
      return "success"; // Req 5.2
    case "Em Triagem":
      return "warning"; // Req 5.3
    case "Suspensa":
      return "danger"; // Req 5.4
    case "Inativa":
      return "neutral"; // Req 5.5
  }
}

// Tokenized classes only — no hardcoded hex (Req 5.6)
export const colorStateClasses: Record<Color_State, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger: "bg-danger/10 text-danger border-danger/20",
  primary: "bg-primary/10 text-primary border-primary/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

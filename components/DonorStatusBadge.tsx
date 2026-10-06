import type { Doadora_Status } from "@/types/doadora";
import { statusColorState, colorStateClasses } from "@/lib/doadora-status";

interface DonorStatusBadgeProps {
  status: Doadora_Status;
}

// Renders a donor status label using the standardized Color_State design tokens
// (bg-*/text-*/border-*). No hardcoded hex color literals (Req 5.6).
export function DonorStatusBadge({ status }: DonorStatusBadgeProps) {
  const colorState = statusColorState(status);
  const tokenClasses = colorStateClasses[colorState];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tokenClasses}`}
    >
      {status}
    </span>
  );
}

export default DonorStatusBadge;

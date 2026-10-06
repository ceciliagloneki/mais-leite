"use client";

import { AlertCircle, RotateCw } from "lucide-react";

interface DonorTableErrorProps {
  message: string;
  onRetry: () => void;
}

// Error state for the donor table. Renders a human-readable error message
// (Req 9.1) and a retry control that invokes onRetry when activated
// (Req 9.2); the page wires onRetry to the query's refetch (Req 9.3).
// Styled with Tailwind design tokens; no shadcn/ui folder exists in this
// project, so this is a styled <button> plus Lucide icons.
export function DonorTableError({ message, onRetry }: DonorTableErrorProps) {
  return (
    <div
      role="alert"
      className="flex w-full flex-col items-center justify-center gap-4 rounded-md border border-danger/20 bg-danger/10 px-6 py-12 text-center"
    >
      <AlertCircle className="h-10 w-10 text-danger" aria-hidden="true" />
      <p className="text-sm font-medium text-danger">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        <RotateCw className="h-4 w-4" aria-hidden="true" />
        Tentar novamente
      </button>
    </div>
  );
}

export default DonorTableError;

"use client";

import { Inbox, SearchX } from "lucide-react";

import { NovaDoadoraButton } from "@/components/NovaDoadoraButton";

interface DonorTableEmptyProps {
  variant: "registered" | "result";
  onNova?: () => void;
}

// Empty state for the donor table with two variants:
// - "registered": no donors are registered at all. Shows a "no donors
//   registered" message plus a "Nova Doadora" CTA that invokes onNova when
//   clicked (Req 10.1, 10.2). The CTA reuses NovaDoadoraButton.
// - "result": a non-empty list produced zero rows after search/filter. Shows a
//   no-match message WITHOUT the registered CTA (Req 3.4).
// Styled with Tailwind design tokens.
export function DonorTableEmpty({ variant, onNova }: DonorTableEmptyProps) {
  if (variant === "registered") {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-4 rounded-md border border-border bg-muted/30 px-6 py-12 text-center">
        <Inbox className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">
          Nenhuma doadora cadastrada
        </p>
        {onNova ? <NovaDoadoraButton onClick={onNova} /> : null}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 rounded-md border border-border bg-muted/30 px-6 py-12 text-center">
      <SearchX className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">
        Nenhuma doadora encontrada
      </p>
    </div>
  );
}

export default DonorTableEmpty;

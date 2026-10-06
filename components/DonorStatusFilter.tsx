"use client";

import type { StatusFilterValue } from "@/lib/doadoras-filter";

interface DonorStatusFilterProps {
  value: StatusFilterValue;
  onChange: (v: StatusFilterValue) => void;
}

// Status group filter exposing exactly "Todas" / "Ativas" / "Inativas" (Req 4.1).
// Controlled via value/onChange; the default selection ("Todas") is owned by the
// parent page (Req 4.2), so this component only reflects the incoming value.
// Implemented as an accessible tablist of buttons styled with design tokens
// (no shadcn/ui components folder exists in this project).
const OPTIONS: StatusFilterValue[] = ["Todas", "Ativas", "Inativas"];

export function DonorStatusFilter({ value, onChange }: DonorStatusFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="Filtrar por status"
      className="inline-flex items-center gap-1 rounded-md border border-input bg-muted/50 p-1"
    >
      {OPTIONS.map((option) => {
        const isSelected = option === value;
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(option)}
            className={
              "inline-flex h-8 items-center rounded-sm px-3 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
              (isSelected
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export default DonorStatusFilter;

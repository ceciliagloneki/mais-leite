"use client";

import { Search } from "lucide-react";

interface DonorSearchFieldProps {
  value: string;
  onChange: (term: string) => void;
}

// Controlled search text input that emits term changes via onChange (Req 3.1).
// Filters the donor list by Nome or Cartão SUS (handled upstream by the page).
export function DonorSearchField({ value, onChange }: DonorSearchFieldProps) {
  return (
    <div className="relative w-full">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="text"
        role="searchbox"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por nome ou Cartão SUS"
        className="flex h-10 w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

export default DonorSearchField;

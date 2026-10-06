"use client";

import { Plus } from "lucide-react";

interface NovaDoadoraButtonProps {
  onClick: () => void;
}

// Primary call-to-action that renders a "Nova Doadora" button (Req 6.1).
// Clicking invokes the onClick callback; the actual navigation to the donor
// registration route is wired by the page via useRouter() (Req 6.2).
// No shadcn/ui components folder exists in this project, so this is a styled
// <button> using Tailwind design tokens (primary button styling).
export function NovaDoadoraButton({ onClick }: NovaDoadoraButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      Nova Doadora
    </button>
  );
}

export default NovaDoadoraButton;

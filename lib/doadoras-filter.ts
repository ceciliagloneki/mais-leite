import type { Doadora } from "@/types/doadora";

export type StatusFilterValue = "Todas" | "Ativas" | "Inativas";

export interface DoadoraFilterCriteria {
  searchTerm: string;
  statusFilter: StatusFilterValue;
}

export function isActive(d: Doadora): boolean {
  return d.status === "Ativa";
}

export function matchesSearch(d: Doadora, term: string): boolean {
  const t = term.trim().toLowerCase();
  if (t === "") return true;
  return (
    d.nome.toLowerCase().includes(t) ||
    d.cartaoSus.toLowerCase().includes(t)
  );
}

export function matchesStatusFilter(d: Doadora, filter: StatusFilterValue): boolean {
  switch (filter) {
    case "Todas":    return true;
    case "Ativas":   return isActive(d);
    case "Inativas": return !isActive(d);
  }
}

export function filterDoadoras(
  list: Doadora[],
  { searchTerm, statusFilter }: DoadoraFilterCriteria,
): Doadora[] {
  return list.filter(
    (d) => matchesStatusFilter(d, statusFilter) && matchesSearch(d, searchTerm),
  );
}

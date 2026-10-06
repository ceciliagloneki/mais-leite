"use client";

import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { Doadora } from "@/types/doadora";
import { DonorStatusBadge } from "@/components/DonorStatusBadge";

interface DonorTableProps {
  doadoras: Doadora[];
  onSelect: (id: string) => void;
}

// Columns rendered in the exact order required (Req 1.4).
const COLUMNS = [
  "Nome",
  "Cartão SUS",
  "Telefone",
  "Zona",
  "Data de cadastro",
  "Status",
  "Quantidade de Coletas",
] as const;

// Formats dataCadastro as a localized date (dd/MM/yyyy, ptBR) via date-fns
// (Req 1.5). Falls back to the raw string when the value cannot be parsed into a
// valid Date, so a single malformed row never breaks the whole table.
function formatDataCadastro(dataCadastro: string): string {
  const date = new Date(dataCadastro);
  if (!isValid(date)) {
    return dataCadastro;
  }
  return format(date, "dd/MM/yyyy", { locale: ptBR });
}

// Renders one row per donor (Req 1.3). Row activation (click or keyboard
// Enter/Space for accessibility) emits onSelect(id) so the page can navigate to
// the donor detail view (Req 7.1).
export function DonorTable({ doadoras, onSelect }: DonorTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
      <table className="w-full caption-bottom text-sm">
        <thead className="border-b border-border bg-muted/40">
          <tr>
            {COLUMNS.map((column) => (
              <th
                key={column}
                scope="col"
                className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {doadoras.map((doadora) => (
            <tr
              key={doadora.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(doadora.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(doadora.id);
                }
              }}
              className="cursor-pointer border-b border-border transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            >
              <td className="px-4 py-3 align-middle font-medium text-foreground">
                {doadora.nome}
              </td>
              <td className="px-4 py-3 align-middle text-foreground">
                {doadora.cartaoSus}
              </td>
              <td className="px-4 py-3 align-middle text-foreground">
                {doadora.telefone}
              </td>
              <td className="px-4 py-3 align-middle text-foreground">
                {doadora.zona}
              </td>
              <td className="px-4 py-3 align-middle text-foreground">
                {formatDataCadastro(doadora.dataCadastro)}
              </td>
              <td className="px-4 py-3 align-middle">
                <DonorStatusBadge status={doadora.status} />
              </td>
              <td className="px-4 py-3 align-middle text-foreground">
                {doadora.quantidadeColetas}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DonorTable;

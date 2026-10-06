"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useDoadoras } from "@/hooks/use-doadoras";
import {
  filterDoadoras,
  isActive,
  type StatusFilterValue,
} from "@/lib/doadoras-filter";
import { DonorSummary } from "@/components/DonorSummary";
import { DonorSearchField } from "@/components/DonorSearchField";
import { DonorStatusFilter } from "@/components/DonorStatusFilter";
import { NovaDoadoraButton } from "@/components/NovaDoadoraButton";
import { DonorTable } from "@/components/DonorTable";
import { DonorTableSkeleton } from "@/components/DonorTableSkeleton";
import { DonorTableError } from "@/components/DonorTableError";
import { DonorTableEmpty } from "@/components/DonorTableEmpty";
import { DonorSheet, type NovaDoadoraInput } from "@/components/DonorSheet";

// Fallback error message when the thrown error carries no readable message.
const DEFAULT_ERROR_MESSAGE =
  "Não foi possível carregar as doadoras. Tente novamente.";

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }
  if (typeof error === "string" && error.trim() !== "") {
    return error;
  }
  return DEFAULT_ERROR_MESSAGE;
}

// Listing_Screen orchestration. Obtains donor data exclusively through the
// useDoadoras hook (Req 11.1) and never calls fetch() or imports the service
// directly (Req 11.3). Holds the client-side search term and status filter,
// derives the visible list via the pure filterDoadoras (Req 4.6), and selects
// exactly one presentation branch (skeleton / error / empty-registered /
// empty-result / table).
export default function DoadorasPage() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useDoadoras();

  const [searchTerm, setSearchTerm] = useState("");
  // Default status filter is "Todas" on mount (Req 4.2).
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("Todas");
  // Controls the "Nova Doadora" lateral sheet (registration form).
  const [sheetOpen, setSheetOpen] = useState(false);

  // Summary counts are always derived from the full loaded data, independent of
  // the active search term and status filter (Req 2.1, 2.2).
  const registered = data.length;
  const active = data.filter(isActive).length;

  // Visible rows after applying both the status filter and the search term
  // (Req 3.3, 4.6).
  const visible = filterDoadoras(data, { searchTerm, statusFilter });

  // "Nova Doadora" now opens a lateral sheet with the registration form instead
  // of navigating away.
  const onNova = () => setSheetOpen(true);
  const onSelect = (id: string) => router.push("/doadoras/" + id); // Req 7.1

  // For now, submitting the form just closes the sheet (no API call yet).
  const onSubmitNova = (_data: NovaDoadoraInput) => {
    setSheetOpen(false);
  };

  // Selects the single presentation branch for the table region, matching the
  // design's state-selection flow precisely.
  function renderTableRegion() {
    // 1. Loading: show only the skeleton, suppressing empty/error (Req 8.1, 8.2).
    if (isLoading) {
      return <DonorTableSkeleton />;
    }

    // 2. Error: message + retry wired to refetch (Req 9.1, 9.2, 9.3).
    if (isError) {
      return (
        <DonorTableError
          message={toErrorMessage(error)}
          onRetry={() => refetch()}
        />
      );
    }

    // 3. Raw list empty: "no donors registered" + CTA to registration (Req 10.1, 10.2).
    if (data.length === 0) {
      return <DonorTableEmpty variant="registered" onNova={onNova} />;
    }

    // 4. Filter removed all rows: empty-result state (Req 3.4).
    if (visible.length === 0) {
      return <DonorTableEmpty variant="result" />;
    }

    // 5. Success: render the table (Req 1.3).
    return <DonorTable doadoras={visible} onSelect={onSelect} />;
  }

  // Summary + controls chrome is shown in the non-error, non-loading states so
  // staff can search/filter against a loaded list and reach the registration
  // route. It is suppressed while loading and on error to keep those states
  // exclusive (Req 8.1, 8.2, 9.x).
  const showChrome = !isLoading && !isError;

  return (
    <main className="flex w-full flex-col gap-6 p-6 lg:p-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Doadoras
          </h1>
          {showChrome ? (
            <DonorSummary registered={registered} active={active} />
          ) : null}
        </div>
        {showChrome ? <NovaDoadoraButton onClick={onNova} /> : null}
      </header>

      {showChrome ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <DonorSearchField value={searchTerm} onChange={setSearchTerm} />
          <DonorStatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>
      ) : null}

      {renderTableRegion()}

      <DonorSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSubmit={onSubmitNova}
      />
    </main>
  );
}

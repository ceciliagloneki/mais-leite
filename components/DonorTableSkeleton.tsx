// Animated skeleton placeholder for the donor table, rendered while the donor
// query is pending (Req 8.1). Uses Tailwind design tokens only (animate-pulse,
// bg-muted) and requires no props. It mirrors the table's column layout so the
// loading state keeps the screen's shape stable before data arrives.

const SKELETON_COLUMN_COUNT = 7;
const SKELETON_ROW_COUNT = 5;

export function DonorTableSkeleton() {
  const columns = Array.from({ length: SKELETON_COLUMN_COUNT });
  const rows = Array.from({ length: SKELETON_ROW_COUNT });

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Carregando doadoras"
      className="w-full overflow-x-auto rounded-md border border-border"
    >
      <table className="w-full caption-bottom text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            {columns.map((_, columnIndex) => (
              <th
                key={columnIndex}
                scope="col"
                className="h-12 px-4 text-left align-middle"
              >
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border">
              {columns.map((__, columnIndex) => (
                <td key={columnIndex} className="px-4 py-3 align-middle">
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <span className="sr-only">Carregando doadoras…</span>
    </div>
  );
}

export default DonorTableSkeleton;

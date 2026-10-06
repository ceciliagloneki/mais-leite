interface DonorSummaryProps {
  registered: number;
  active: number;
}

// Renders the donor summary counts in the exact format
// "{registered} cadastradas · {active} ativas" (Req 2.1, 2.2, 2.3).
export function DonorSummary({ registered, active }: DonorSummaryProps) {
  return (
    <p className="text-sm text-muted-foreground">
      {`${registered} cadastradas · ${active} ativas`}
    </p>
  );
}

export default DonorSummary;

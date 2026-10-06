// Página inicial do painel. Placeholder enquanto os indicadores não estão
// definidos — serve de referência de layout para as demais áreas.
export default function DashboardPage() {
  return (
    <main className="flex w-full flex-col gap-6 p-6 lg:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Visão geral do Banco de Leite Humano de Marília
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Doadoras ativas", "Coletas no mês", "Estoque disponível"].map(
          (titulo) => (
            <div
              key={titulo}
              className="rounded-xl border border-border bg-surface p-5 shadow-sm"
            >
              <p className="text-sm text-muted-foreground">{titulo}</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">—</p>
            </div>
          ),
        )}
      </div>
    </main>
  );
}

import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  /** Título da área (ex.: "Processamento"). */
  title: string;
  /** Descrição curta opcional exibida abaixo do título. */
  description?: string;
}

// Ponto de partida padronizado para novas áreas do sistema. Use enquanto a
// página real não está pronta — mantém o mesmo cabeçalho/espaçamento das
// demais telas do painel.
//
// Exemplo de uso em app/(dashboard)/processamento/page.tsx:
//   import { PlaceholderPage } from "@/components/PlaceholderPage";
//   export default function ProcessamentoPage() {
//     return <PlaceholderPage title="Processamento" />;
//   }
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <main className="flex w-full flex-col gap-6 p-6 lg:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </header>

      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface p-12 text-center">
        <Construction className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          Esta área está em construção.
        </p>
      </div>
    </main>
  );
}

export default PlaceholderPage;

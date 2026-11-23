"use client";

import { useRouter } from "next/navigation";

import { DoadoraFormFields } from "@/components/DoadoraFormFields";
import { FormCard } from "@/components/FormCard";
import { PageHeader } from "@/components/PageHeader";
import { useCriarDoadora, useZonas } from "@/hooks/use-doadoras";
import type { DoadoraDetalhe } from "@/types/doadora";

export default function NovaDoadoraPage() {
  const router = useRouter();
  const zonas = useZonas();
  const criar = useCriarDoadora();

  return (
    <main className="flex w-full flex-col gap-3 px-4 pb-10 pt-3 sm:px-6 lg:min-h-screen">
      <PageHeader
        voltar={{ href: "/doadoras", texto: "Voltar para a Lista" }}
        titulo="Nova Doadora"
        descricao="Preencha a ficha de identificação. Depois de salvar, você vai direto para a ficha dela para registrar a triagem."
      />

      <FormCard
        titulo="Ficha de Identificação"
        botao="Cadastrar Doadora"
        mensagemSucesso="Doadora cadastrada! Agora registre a triagem."
        semFechar
        preencher
        onSubmit={criar.mutateAsync}
        onCancelar={() => router.push("/doadoras")}
        aoSalvar={(resposta) => router.push(`/doadoras/${(resposta as DoadoraDetalhe).id}`)}
      >
        <DoadoraFormFields zonas={zonas.data ?? []} />
      </FormCard>
    </main>
  );
}

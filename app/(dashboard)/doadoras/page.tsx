"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";

import { classeBotao } from "@/components/Button";
import { Card } from "@/components/Card";
import { DataTable, TextoDuplo } from "@/components/DataTable";
import { Filtros } from "@/components/Filters";
import { PageHeader } from "@/components/PageHeader";
import { Busca } from "@/components/SearchInput";
import { StatusBadge } from "@/components/StatusBadge";
import { useDoadoras } from "@/hooks/use-doadoras";
import { contem, formatarCartaoSus, formatarData, rotulo } from "@/lib/format";

const SITUACOES = ["ativa", "em_triagem", "inapta", "removida"];

export default function DoadorasPage() {
  const router = useRouter();
  const doadoras = useDoadoras();
  const [busca, setBusca] = useState("");
  const [situacao, setSituacao] = useState("todas");

  const lista = doadoras.data ?? [];
  const total = (status: string) => lista.filter((d) => d.status === status).length;
  const visiveis = lista.filter(
    (d) =>
      (situacao === "todas" || d.status === situacao) && (contem(d.nome, busca) || contem(d.cartao_sus, busca.replace(/\s/g, "")) || contem(d.telefone, busca)),
  );

  return (
    <main className="flex w-full flex-col gap-4 p-4 sm:p-6">
      <PageHeader
        titulo="Doadoras"
        descricao="Clique em uma doadora para ver a ficha, a triagem e as sorologias."
        acao={
          <Link href="/doadoras/nova" className={classeBotao("primario")}>
            <Plus className="h-5 w-5" aria-hidden="true" />
            Nova Doadora
          </Link>
        }
      />

      <Card
        tabela
        filtros={
          <>
            <Busca valor={busca} onMudar={setBusca} placeholder="Buscar por nome, Cartão SUS ou telefone" />
            <Filtros
              ativo={situacao}
              onTrocar={setSituacao}
              opcoes={[{ valor: "todas", texto: "Todas", total: lista.length }, ...SITUACOES.map((s) => ({ valor: s, texto: rotulo(s), total: total(s) }))]}
            />
          </>
        }
      >
        <DataTable
          carregando={doadoras.isLoading}
          erro={doadoras.error}
          itens={visiveis}
          vazio={busca || situacao !== "todas" ? "Nenhuma doadora encontrada com esse filtro." : "Nenhuma doadora cadastrada ainda."}
          aoClicar={(d) => router.push(`/doadoras/${d.id}`)}
          colunas={[
            {
              titulo: "Doadora",
              valor: (d) => <TextoDuplo principal={d.nome} secundario={`SUS ${formatarCartaoSus(d.cartao_sus)}`} />,
            },
            { titulo: "Telefone", valor: (d) => d.telefone || "—" },
            {
              titulo: "Zona da coleta",
              valor: (d) => <TextoDuplo principal={d.zona_nome} secundario={rotulo(d.dia_da_semana)} />,
            },
            { titulo: "Cadastro", valor: (d) => formatarData(d.data_cad.slice(0, 10)) },
            { titulo: "Situação", valor: (d) => <StatusBadge status={d.status} /> },
          ]}
        />
      </Card>
    </main>
  );
}

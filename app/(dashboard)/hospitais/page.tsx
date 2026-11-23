"use client";

import { useState } from "react";
import { FilePlus2, Plus } from "lucide-react";

import { Botao } from "@/components/Button";
import { Card } from "@/components/Card";
import { Codigo, DataTable, Numero, TextoDuplo } from "@/components/DataTable";
import { Campo, Selecao } from "@/components/Field";
import { Filtros } from "@/components/Filters";
import { FormModal } from "@/components/FormModal";
import { PageHeader } from "@/components/PageHeader";
import { Busca } from "@/components/SearchInput";
import { StatusBadge } from "@/components/StatusBadge";
import { Abas } from "@/components/Tabs";
import { useCriarDemanda, useCriarHospital, useCriarPrescricao, useDemandas, useHospitais, usePrescricoes } from "@/hooks/use-hospitais";
import { contem, formatarData, formatarTelefone, hoje, ml, opcoes, rotulo } from "@/lib/format";

type AbaHospitais = "pedidos" | "receitas" | "hospitais";
type Formulario = { tipo: "pedido" } | { tipo: "receita"; pedidoId?: number } | { tipo: "hospital" } | null;

export default function HospitaisPage() {
  const hospitais = useHospitais();
  const demandas = useDemandas();
  const prescricoes = usePrescricoes();
  const criarHospital = useCriarHospital();
  const criarDemanda = useCriarDemanda();
  const criarPrescricao = useCriarPrescricao();
  const [aba, setAba] = useState<AbaHospitais>("pedidos");
  const [formulario, setFormulario] = useState<Formulario>(null);
  const [busca, setBusca] = useState("");
  const [situacao, setSituacao] = useState("pendente");

  const listaDemandas = demandas.data ?? [];
  const pendentes = listaDemandas.filter((d) => d.status === "pendente");
  const pedidosVisiveis = listaDemandas.filter(
    (d) => (situacao === "todos" || d.status === situacao) && (contem(d.hospital_nome, busca) || contem(d.id, busca)),
  );
  const receitasVisiveis = (prescricoes.data ?? []).filter((p) => contem(p.nome_do_rn, busca) || contem(p.hospital_nome, busca));
  const hospitaisVisiveis = (hospitais.data ?? []).filter((h) => contem(h.nome, busca));

  function trocarAba(nova: AbaHospitais) {
    setAba(nova);
    setBusca("");
  }
  const fechar = () => setFormulario(null);

  const botaoNovo = {
    pedidos: (
      <Botao icone={Plus} onClick={() => setFormulario({ tipo: "pedido" })}>
        Novo Pedido
      </Botao>
    ),
    receitas: (
      <Botao icone={Plus} onClick={() => setFormulario({ tipo: "receita" })}>
        Nova Receita
      </Botao>
    ),
    hospitais: (
      <Botao icone={Plus} onClick={() => setFormulario({ tipo: "hospital" })}>
        Novo Hospital
      </Botao>
    ),
  }[aba];

  const filtros = (
    <>
      <Busca
        valor={busca}
        onMudar={setBusca}
        placeholder={aba === "pedidos" ? "Buscar por hospital ou nº do pedido" : aba === "receitas" ? "Buscar por bebê ou hospital" : "Buscar hospital"}
      />
      {aba === "pedidos" ? (
        <Filtros
          ativo={situacao}
          onTrocar={setSituacao}
          opcoes={[
            { valor: "pendente", texto: "Em aberto", total: pendentes.length },
            { valor: "atendida", texto: "Atendidos", total: listaDemandas.length - pendentes.length },
            { valor: "todos", texto: "Todos", total: listaDemandas.length },
          ]}
        />
      ) : null}
    </>
  );

  return (
    <main className="flex w-full flex-col gap-5 p-4 sm:p-6">
      <PageHeader
        titulo="Hospitais e Pedidos"
        descricao="Quanto leite cada hospital precisa e para quais bebês. Primeiro registre o pedido do dia; depois, uma receita médica para cada bebê."
        acao={botaoNovo}
      />

      {formulario?.tipo === "pedido" ? (
        <FormModal
          titulo="Novo Pedido do Hospital"
          descricao="Quanto leite o hospital pediu para o dia e para quantos bebês internados. Em seguida, cadastre a receita de cada bebê."
          botao="Salvar Pedido"
          mensagemSucesso="Pedido registrado. Agora adicione as receitas."
          onSubmit={criarDemanda.mutateAsync}
          onFechar={fechar}
        >
          <Selecao label="Hospital" name="hospital_id" required opcoes={(hospitais.data ?? []).map((h) => ({ valor: h.id, texto: h.nome }))} />
          <Campo label="Data do pedido" name="data_demanda" type="date" required defaultValue={hoje()} />
          <Campo label="Volume total pedido (mL)" name="volume_total" type="number" min={1} required />
          <Campo label="Número de bebês internados" name="numero_de_bebes" type="number" min={1} required />
        </FormModal>
      ) : null}

      {formulario?.tipo === "receita" ? (
        <FormModal
          titulo="Nova Receita Médica"
          descricao="A prescrição de um bebê do pedido: quanto leite ele deve receber e de qual tipo. O tipo define quais frascos podem ser separados para ele."
          botao="Salvar Receita"
          mensagemSucesso="Receita registrada."
          onSubmit={criarPrescricao.mutateAsync}
          onFechar={fechar}
        >
          <Selecao
            label="Pedido"
            name="demanda_id"
            required
            largo
            defaultValue={formulario.pedidoId}
            opcoes={pendentes.map((d) => ({ valor: d.id, texto: `Pedido nº ${d.id} · ${d.hospital_nome} · ${formatarData(d.data_demanda)}` }))}
          />
          <Campo label="Nome do bebê (RN)" name="nome_do_rn" required placeholder="Ex.: RN de Maria Silva" />
          <Campo label="Volume prescrito (mL)" name="volume_prescrito" type="number" min={1} required />
          <Selecao label="Tipo de leite" name="tipo_leite" required opcoes={opcoes(["colostro", "transicao", "maduro"])} />
        </FormModal>
      ) : null}

      {formulario?.tipo === "hospital" ? (
        <FormModal
          titulo="Novo Hospital"
          descricao="Hospital que recebe leite do banco. Depois de cadastrado, ele pode fazer pedidos."
          botao="Salvar Hospital"
          mensagemSucesso="Hospital cadastrado."
          onSubmit={criarHospital.mutateAsync}
          onFechar={fechar}
        >
          <Campo label="Nome do hospital" name="nome" required />
          <Campo
            label="Telefone"
            name="telefone"
            type="tel"
            placeholder="(14) 0000-0000"
            inputMode="tel"
            maxLength={15}
            onInput={(e) => (e.currentTarget.value = formatarTelefone(e.currentTarget.value))}
          />
        </FormModal>
      ) : null}

      <Abas<AbaHospitais>
        ativa={aba}
        onTrocar={trocarAba}
        abas={[
          { id: "pedidos", titulo: "Pedidos", contador: pendentes.length || undefined },
          { id: "receitas", titulo: "Receitas Médicas" },
          { id: "hospitais", titulo: "Hospitais" },
        ]}
      />

      {aba === "pedidos" ? (
        <Card
          titulo="Pedidos dos hospitais"
          descricao="O pedido fica em aberto até a ficha de distribuição dele ser gerada. Adicione uma receita para cada bebê do pedido."
          tabela
          filtros={filtros}
        >
          <DataTable
            carregando={demandas.isLoading}
            erro={demandas.error}
            itens={pedidosVisiveis}
            vazio="Nenhum pedido encontrado."
            colunas={[
              { titulo: "Nº", valor: (d) => <Codigo>{d.id}</Codigo> },
              { titulo: "Data", valor: (d) => formatarData(d.data_demanda) },
              { titulo: "Hospital", valor: (d) => <TextoDuplo principal={d.hospital_nome} /> },
              { titulo: "Volume pedido", valor: (d) => <Numero>{ml(d.volume_total)}</Numero>, direita: true },
              { titulo: "Bebês", valor: (d) => <Numero>{d.numero_de_bebes}</Numero>, direita: true },
              { titulo: "Receitas", valor: (d) => <Numero>{d.quant_prescricoes}</Numero>, direita: true },
              { titulo: "Situação", valor: (d) => <StatusBadge status={d.status} texto={d.status === "pendente" ? "Em aberto" : "Atendido"} /> },
              {
                titulo: "",
                direita: true,
                valor: (d) =>
                  d.status === "pendente" ? (
                    <Botao variante="secundario" pequeno icone={FilePlus2} onClick={() => setFormulario({ tipo: "receita", pedidoId: d.id })}>
                      Adicionar Receita
                    </Botao>
                  ) : null,
              },
            ]}
          />
        </Card>
      ) : null}

      {aba === "receitas" ? (
        <Card titulo="Receitas médicas" descricao="O que cada bebê deve receber e quanto já foi separado para ele na Preparação." tabela filtros={filtros}>
          <DataTable
            carregando={prescricoes.isLoading}
            erro={prescricoes.error}
            itens={receitasVisiveis}
            vazio="Nenhuma receita encontrada."
            colunas={[
              { titulo: "Bebê (RN)", valor: (p) => <TextoDuplo principal={p.nome_do_rn} /> },
              { titulo: "Hospital", valor: (p) => `${p.hospital_nome} · pedido nº ${p.demanda_id}` },
              { titulo: "Tipo de leite", valor: (p) => rotulo(p.tipo_leite) },
              { titulo: "Prescrito", valor: (p) => <Numero>{ml(p.volume_prescrito)}</Numero>, direita: true },
              { titulo: "Separado", valor: (p) => <Numero>{ml(p.volume_alocado)}</Numero>, direita: true },
              { titulo: "Pedido", valor: (p) => <StatusBadge status={p.demanda_status} texto={p.demanda_status === "pendente" ? "Em aberto" : "Atendido"} /> },
            ]}
          />
        </Card>
      ) : null}

      {aba === "hospitais" ? (
        <Card titulo="Hospitais atendidos" descricao="Hospitais que recebem leite humano pasteurizado do banco." tabela filtros={filtros}>
          <DataTable
            carregando={hospitais.isLoading}
            erro={hospitais.error}
            itens={hospitaisVisiveis}
            vazio="Nenhum hospital cadastrado."
            colunas={[
              { titulo: "Nº", valor: (h) => <Codigo>{h.id}</Codigo> },
              { titulo: "Hospital", valor: (h) => <TextoDuplo principal={h.nome} /> },
              { titulo: "Telefone", valor: (h) => h.telefone || "—" },
            ]}
          />
        </Card>
      ) : null}
    </main>
  );
}

"use client";

import { useState } from "react";
import { CheckCircle2, FlaskConical, Microscope, Milk, Package, Plus, Printer } from "lucide-react";

import { Aviso } from "@/components/Alert";
import { Botao } from "@/components/Button";
import { Card } from "@/components/Card";
import { Codigo, DataTable, Numero, TextoDuplo } from "@/components/DataTable";
import { Campo, Grupo, ListaMarcar, Selecao, SimNao, ValorFixo } from "@/components/Field";
import { Filtros } from "@/components/Filters";
import { EtiquetaLeitePasteurizado } from "@/components/Etiquetas";
import { FormModal } from "@/components/FormModal";
import { ImpressaoModal } from "@/components/Modal";
import { PageHeader } from "@/components/PageHeader";
import { Busca } from "@/components/SearchInput";
import { Indicador } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Abas } from "@/components/Tabs";
import { useFrascosCrus } from "@/hooks/use-coletas";
import { useDoadoras } from "@/hooks/use-doadoras";
import { useCriarPasteurizacao, useFrascosPasteurizados, usePasteurizacoes, useReenvasar, useRegistrarAnalise } from "@/hooks/use-processamento";
import { contem, formatarData, hoje, ml, opcoes, rotulo } from "@/lib/format";
import type { DadosFormulario } from "@/lib/form";
import type { FrascoCru } from "@/types/coleta";
import type { FrascoPasteurizado, Pasteurizacao } from "@/types/processamento";

type AbaProcessamento = "pasteurizacao" | "reenvase" | "analise" | "frascos";
type Formulario =
  { tipo: "pasteurizacao" } | { tipo: "reenvase"; pasteurizacaoId?: number; doadoraId?: number } | { tipo: "analise"; frascoId?: number } | null;

export default function ProcessamentoPage() {
  const conformes = useFrascosCrus("conforme");
  const crusPasteurizados = useFrascosCrus("pasteurizado");
  const pasteurizacoes = usePasteurizacoes();
  const frascos = useFrascosPasteurizados();
  const pasteurizar = useCriarPasteurizacao();
  const reenvasar = useReenvasar();
  const analisar = useRegistrarAnalise();
  const [aba, setAba] = useState<AbaProcessamento>("pasteurizacao");
  const [formulario, setFormulario] = useState<Formulario>(null);
  const [etiqueta, setEtiqueta] = useState<FrascoPasteurizado | null>(null);
  const [busca, setBusca] = useState("");
  const [situacao, setSituacao] = useState("todos");

  const listaFrascos = frascos.data ?? [];
  const saldos = saldosDeReenvase(pasteurizacoes.data ?? [], crusPasteurizados.data ?? [], frascos.data ?? []);
  const pendentesReenvase = saldos.filter((x) => x.restante > 0);
  const doadoras = useDoadoras();
  const nomeDoadora = (id: number) => doadoras.data?.find((d) => d.id === id)?.nome ?? `Nº ${id}`;
  const listaConformes = conformes.data ?? [];
  const volumeConforme = listaConformes.reduce((s, f) => s + Number(f.volume_ml), 0);
  const totalFrascos = (status: string) => listaFrascos.filter((f) => f.status === status).length;
  const emQuarentena = listaFrascos.filter((f) => f.status === "quarentena");
  const frascosVisiveis = listaFrascos.filter(
    (f) => (situacao === "todos" || f.status === situacao) && (contem(f.id, busca) || contem(f.doadora_id, busca) || contem(nomeDoadora(f.doadora_id), busca)),
  );

  function abrir(novo: Formulario, novaAba?: AbaProcessamento) {
    if (novaAba) setAba(novaAba);
    setFormulario(novo);
  }
  const fechar = () => setFormulario(null);

  return (
    <main className="flex w-full flex-col gap-5 p-4 sm:p-6">
      <PageHeader
        titulo="Processamento"
        descricao="Do leite cru conforme ao leite liberado para os bebês: pasteurize, reenvase o leite de cada doadora em frascos novos e analise cada frasco antes de liberar."
        acao={
          <Botao icone={Plus} onClick={() => abrir({ tipo: "pasteurizacao" }, "pasteurizacao")}>
            Nova Pasteurização
          </Botao>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador
          titulo="Prontos para pasteurizar"
          valor={conformes.isLoading ? "…" : listaConformes.length}
          unidade={listaConformes.length === 1 ? "frasco cru" : "frascos crus"}
          complemento={ml(volumeConforme)}
          icone={FlaskConical}
          tom="alerta"
          descricao="Aprovados na recepção e guardados. Separe e descongele para levar ao pasteurizador."
          onClick={() => abrir({ tipo: "pasteurizacao" }, "pasteurizacao")}
          acao="Nova pasteurização"
        />
        <Indicador
          titulo="Falta reenvasar"
          valor={pasteurizacoes.isLoading ? "…" : pendentesReenvase.length}
          unidade={pendentesReenvase.length === 1 ? "doadora" : "doadoras"}
          complemento={ml(pendentesReenvase.reduce((s, x) => s + x.restante, 0))}
          icone={Package}
          tom="alerta"
          descricao="Leite já pasteurizado que ainda precisa ir para frascos novos, separado por doadora."
          onClick={() => setAba("reenvase")}
          acao="Reenvasar"
        />
        <Indicador
          titulo="Aguardando análise"
          valor={frascos.isLoading ? "…" : emQuarentena.length}
          unidade={emQuarentena.length === 1 ? "frasco" : "frascos"}
          complemento={ml(emQuarentena.reduce((s, f) => s + Number(f.volume), 0))}
          icone={Microscope}
          tom="alerta"
          descricao="Pasteurizados e em quarentena. Só vão para o estoque depois da análise físico-química."
          onClick={() => setAba("analise")}
          acao="Registrar análises"
        />
        <Indicador
          titulo="Liberados para uso"
          valor={frascos.isLoading ? "…" : totalFrascos("disponivel")}
          unidade={totalFrascos("disponivel") === 1 ? "frasco" : "frascos"}
          complemento={ml(listaFrascos.filter((f) => f.status === "disponivel").reduce((s, f) => s + Number(f.volume), 0))}
          icone={CheckCircle2}
          tom="sucesso"
          descricao="Aprovados na análise e prontos para separar para as receitas dos bebês."
          href="/preparacao"
          acao="Ir para preparação"
        />
      </div>

      {etiqueta ? (
        <ImpressaoModal titulo={`Etiqueta do frasco nº ${etiqueta.id}`} onFechar={() => setEtiqueta(null)}>
          <EtiquetaLeitePasteurizado frasco={etiqueta} />
        </ImpressaoModal>
      ) : null}

      {formulario?.tipo === "pasteurizacao" ? (
        <FormModal
          titulo="1. Nova Pasteurização"
          descricao="Marque os frascos crus (já descongelados e separados) que entraram no pasteurizador."
          botao="Salvar Pasteurização"
          tamanho="lg"
          mensagemSucesso="Pasteurização registrada. Agora faça o reenvase."
          onSubmit={pasteurizar.mutateAsync}
          onFechar={fechar}
        >
          <Campo label="Data da pasteurização" name="data_pasteurizacao" type="date" required defaultValue={hoje()} />
          <ListaMarcar
            label="Frascos crus conformes"
            name="frascos_ids"
            vazio="Nenhum frasco cru conforme aguardando. Eles aparecem aqui depois da Recepção."
            itens={(conformes.data ?? []).map((f) => ({
              valor: f.id,
              texto: `Nº ${f.id} · ${f.doadora_nome} · ${ml(f.volume_ml)} · ${rotulo(f.classificacao)}`,
            }))}
          />
        </FormModal>
      ) : null}

      {formulario?.tipo === "reenvase" ? (
        <FormReenvase
          pasteurizacaoInicial={formulario.pasteurizacaoId}
          doadoraInicial={formulario.doadoraId}
          pasteurizacoes={pasteurizacoes.data ?? []}
          crus={crusPasteurizados.data ?? []}
          reenvasados={listaFrascos}
          onSubmit={reenvasar.mutateAsync}
          onFechar={fechar}
        />
      ) : null}

      {formulario?.tipo === "analise" ? (
        <FormModal
          titulo="3. Análise Físico-Química"
          descricao="BGBL negativo e acidez Dornic até 8 °D liberam o frasco para uso."
          botao="Salvar Análise"
          mensagemSucesso="Análise registrada."
          onSubmit={analisar.mutateAsync}
          onFechar={fechar}
        >
          <Selecao
            label="Frasco em quarentena"
            name="frasco_pasteurizado_id"
            required
            defaultValue={formulario.frascoId}
            opcoes={emQuarentena.map((f) => ({ valor: f.id, texto: `Frasco nº ${f.id} · ${ml(f.volume)} · ${rotulo(f.classificacao)}` }))}
          />
          <Campo label="Data da análise" name="data_analise" type="date" required defaultValue={hoje()} />
          <Grupo>Crematócrito</Grupo>
          <Campo label="TC — teor de creme (%)" name="crematocrito_tc" type="number" required />
          <Campo label="TG — teor de gordura (%)" name="crematocrito_tg" type="number" required />
          <Campo label="E — energia (kcal/L)" name="crematocrito_e" type="number" required />
          <Grupo>Outros controles</Grupo>
          <Campo label="Acidez Dornic (°D)" name="dornic" type="number" required ajuda="Até 8 °D é aprovado." />
          <Campo label="Temperatura (°C)" name="temperatura" type="number" required />
          <SimNao label="Resultado do BGBL" name="bgbl" required textoSim="Negativo (ok)" textoNao="Positivo" valorSim="negativo" valorNao="positivo" />
        </FormModal>
      ) : null}

      <Abas<AbaProcessamento>
        ativa={aba}
        onTrocar={setAba}
        abas={[
          { id: "pasteurizacao", titulo: "1. Pasteurização", icone: FlaskConical },
          { id: "reenvase", titulo: "2. Reenvase", icone: Package, contador: pendentesReenvase.length || undefined },
          { id: "analise", titulo: "3. Análise", icone: Microscope, contador: emQuarentena.length || undefined },
          { id: "frascos", titulo: "Frascos Processados", icone: Milk },
        ]}
      />

      {aba === "pasteurizacao" ? (
        <Card titulo="Pasteurizações" descricao="Cada pasteurização reúne os frascos crus conformes que entraram juntos no pasteurizador." tabela>
          <DataTable
            carregando={pasteurizacoes.isLoading}
            erro={pasteurizacoes.error}
            itens={pasteurizacoes.data}
            vazio="Nenhuma pasteurização registrada. Use “Nova Pasteurização” no topo da página."
            colunas={[
              { titulo: "Nº", valor: (p) => <Codigo>{p.id}</Codigo> },
              { titulo: "Data", valor: (p) => formatarData(p.data_pasteurizacao) },
              {
                titulo: "Leite cru",
                valor: (p) => (
                  <TextoDuplo principal={ml(p.volume_cru)} secundario={`${p.quant_frascos_crus} frasco${Number(p.quant_frascos_crus) === 1 ? "" : "s"}`} />
                ),
              },
              {
                titulo: "Reenvasado",
                valor: (p) => (
                  <TextoDuplo
                    principal={ml(p.volume_reenvasado)}
                    secundario={`${p.quant_frascos_pasteurizados} frasco${Number(p.quant_frascos_pasteurizados) === 1 ? "" : "s"} novo${Number(p.quant_frascos_pasteurizados) === 1 ? "" : "s"}`}
                  />
                ),
              },
              {
                titulo: "Reenvase",
                valor: (p) =>
                  saldos.some((x) => x.pasteurizacao.id === p.id && x.restante > 0) ? (
                    <StatusBadge status="pendente" texto="Falta reenvasar" />
                  ) : (
                    <StatusBadge status="conforme" texto="Concluído" />
                  ),
              },
              { titulo: "Responsável", valor: (p) => p.funcionario_nome },
            ]}
          />
        </Card>
      ) : null}

      {aba === "reenvase" ? (
        <Card
          titulo="Leite pasteurizado por doadora"
          descricao="O leite de cada doadora é reenvasado em frascos novos, separado por doadora. Cada frasco novo vai para a quarentena até a análise."
          tabela
        >
          <DataTable
            carregando={pasteurizacoes.isLoading || crusPasteurizados.isLoading}
            itens={[...pendentesReenvase, ...saldos.filter((x) => x.restante === 0)]}
            vazio="Nenhuma pasteurização registrada ainda."
            colunas={[
              {
                titulo: "Pasteurização",
                valor: (x) => <TextoDuplo principal={`Nº ${x.pasteurizacao.id}`} secundario={formatarData(x.pasteurizacao.data_pasteurizacao)} />,
              },
              { titulo: "Doadora", valor: (x) => <TextoDuplo principal={x.nome} secundario={`Doadora nº ${x.id}`} /> },
              { titulo: "Tipo", valor: (x) => x.tipos.map((t) => rotulo(t)).join(", ") },
              { titulo: "Leite cru", valor: (x) => <Numero>{ml(x.cru)}</Numero>, direita: true },
              { titulo: "Reenvasado", valor: (x) => <Numero>{ml(x.cru - x.restante)}</Numero>, direita: true },
              { titulo: "Falta", valor: (x) => <Numero forte>{ml(x.restante)}</Numero>, direita: true },
              {
                titulo: "",
                direita: true,
                valor: (x) =>
                  x.restante > 0 ? (
                    <Botao pequeno icone={Package} onClick={() => abrir({ tipo: "reenvase", pasteurizacaoId: x.pasteurizacao.id, doadoraId: x.id })}>
                      Reenvasar
                    </Botao>
                  ) : (
                    <StatusBadge status="conforme" texto="Concluído" />
                  ),
              },
            ]}
          />
        </Card>
      ) : null}

      {aba === "analise" ? (
        <>
          {emQuarentena.length === 0 && !frascos.isLoading ? <Aviso tom="sucesso" titulo="Nenhum frasco aguardando análise." /> : null}
          <Card titulo="Frascos em quarentena" descricao="Registre a análise de cada frasco para liberar (ou reprovar) o leite." tabela>
            <DataTable
              carregando={frascos.isLoading}
              erro={frascos.error}
              itens={emQuarentena}
              vazio="Nenhum frasco em quarentena."
              colunas={[
                { titulo: "Nº frasco", valor: (f) => <Codigo>{f.id}</Codigo> },
                { titulo: "Doadora", valor: (f) => <TextoDuplo principal={nomeDoadora(f.doadora_id)} secundario={`Doadora nº ${f.doadora_id}`} /> },
                { titulo: "Tipo", valor: (f) => rotulo(f.classificacao) },
                { titulo: "Volume", valor: (f) => <Numero>{ml(f.volume)}</Numero>, direita: true },
                { titulo: "Pasteurizado em", valor: (f) => formatarData(f.data_pasteurizacao) },
                {
                  titulo: "",
                  direita: true,
                  valor: (f) => (
                    <Botao pequeno icone={Microscope} onClick={() => abrir({ tipo: "analise", frascoId: f.id })}>
                      Registrar Análise
                    </Botao>
                  ),
                },
              ]}
            />
          </Card>
        </>
      ) : null}

      {aba === "frascos" ? (
        <Card
          tabela
          filtros={
            <>
              <Busca valor={busca} onMudar={setBusca} placeholder="Buscar por nº do frasco ou da doadora" />
              <Filtros
                ativo={situacao}
                onTrocar={setSituacao}
                opcoes={[
                  { valor: "todos", texto: "Todos", total: listaFrascos.length },
                  ...["quarentena", "disponivel", "alocado", "distribuido", "reprovado", "bloqueado"].map((s) => ({
                    valor: s,
                    texto: rotulo(s),
                    total: totalFrascos(s),
                  })),
                ]}
              />
            </>
          }
        >
          <DataTable
            carregando={frascos.isLoading}
            erro={frascos.error}
            itens={frascosVisiveis}
            vazio="Nenhum frasco encontrado."
            colunas={[
              { titulo: "Nº frasco", valor: (f) => <Codigo>{f.id}</Codigo> },
              { titulo: "Doadora", valor: (f) => <TextoDuplo principal={nomeDoadora(f.doadora_id)} secundario={`Doadora nº ${f.doadora_id}`} /> },
              { titulo: "Tipo", valor: (f) => rotulo(f.classificacao) },
              { titulo: "Volume", valor: (f) => <Numero>{ml(f.volume)}</Numero>, direita: true },
              { titulo: "Pasteurizado em", valor: (f) => formatarData(f.data_pasteurizacao) },
              {
                titulo: "Análise",
                valor: (f) =>
                  f.data_analise ? (
                    <span className="text-sm text-muted-foreground">
                      Dornic {f.dornic} °D · BGBL {rotulo(f.bgbl)}
                    </span>
                  ) : (
                    "—"
                  ),
              },
              { titulo: "Situação", valor: (f) => <StatusBadge status={f.status} /> },
              {
                titulo: "",
                direita: true,
                valor: (f) => (
                  <Botao variante="secundario" pequeno icone={Printer} onClick={() => setEtiqueta(f)}>
                    Etiqueta
                  </Botao>
                ),
              },
            ]}
          />
        </Card>
      ) : null}
    </main>
  );
}

function FormReenvase({
  pasteurizacaoInicial,
  doadoraInicial,
  pasteurizacoes,
  crus,
  reenvasados,
  onSubmit,
  onFechar,
}: {
  pasteurizacaoInicial?: number;
  doadoraInicial?: number;
  pasteurizacoes: Pasteurizacao[];
  crus: FrascoCru[];
  reenvasados: FrascoPasteurizado[];
  onSubmit: (dados: DadosFormulario) => Promise<unknown>;
  onFechar: () => void;
}) {
  const [pasteurizacaoId, setPasteurizacaoId] = useState(pasteurizacaoInicial ? String(pasteurizacaoInicial) : "");
  const [doadoraId, setDoadoraId] = useState(doadoraInicial ? String(doadoraInicial) : "");

  const saldos = saldosDeReenvase(pasteurizacoes, crus, reenvasados).filter((x) => String(x.pasteurizacao.id) === pasteurizacaoId);
  const doadora = saldos.find((d) => String(d.id) === doadoraId);
  const tipos = doadora ? Array.from(doadora.tipos) : [];

  return (
    <FormModal
      titulo="2. Reenvase (Novo Frasco Pasteurizado)"
      descricao="Separe por doadora e volume. Cada frasco novo recebe uma etiqueta própria."
      botao="Salvar Frasco"
      mensagemSucesso="Frasco reenvasado. Ele fica em quarentena até a análise."
      onSubmit={onSubmit}
      onFechar={onFechar}
    >
      <div
        className="contents"
        onChange={(e) => {
          const alvo = e.target as HTMLSelectElement;
          if (alvo.name === "pasteurizacao_id") {
            setPasteurizacaoId(alvo.value);
            setDoadoraId("");
          }
          if (alvo.name === "doadora_id") setDoadoraId(alvo.value);
        }}
      >
        <Selecao
          label="Pasteurização"
          name="pasteurizacao_id"
          required
          defaultValue={pasteurizacaoInicial}
          opcoes={pasteurizacoes.map((p) => ({ valor: p.id, texto: `Nº ${p.id} · ${formatarData(p.data_pasteurizacao)}` }))}
        />
        <Selecao
          key={pasteurizacaoId}
          label="Doadora"
          name="doadora_id"
          required
          defaultValue={doadoraId || undefined}
          ajuda={pasteurizacaoId ? undefined : "Escolha a pasteurização primeiro."}
          opcoes={saldos.filter((d) => d.restante > 0).map((d) => ({ valor: d.id, texto: `Nº ${d.id} · ${d.nome} · restam ${ml(d.restante)}` }))}
        />
      </div>
      <Campo
        key={`volume-${doadoraId}`}
        label="Volume (mL)"
        name="volume"
        type="number"
        min={1}
        max={doadora?.restante || undefined}
        required
        ajuda={doadora ? `Restam ${ml(doadora.restante)} de leite cru desta doadora.` : undefined}
      />
      {tipos.length > 1 ? (
        <Selecao
          label="Tipo de leite"
          name="classificacao"
          required
          opcoes={opcoes(tipos)}
          ajuda="A doadora tem mais de um tipo de leite nesta pasteurização."
        />
      ) : (
        <ValorFixo rotulo="Tipo de leite" valor={tipos[0] ? rotulo(tipos[0]) : "—"} ajuda="O mesmo dos frascos crus da doadora." />
      )}
    </FormModal>
  );
}

interface SaldoReenvase {
  pasteurizacao: Pasteurizacao;
  id: number;
  nome: string;
  cru: number;
  restante: number;
  tipos: string[];
}

function saldosDeReenvase(pasteurizacoes: Pasteurizacao[], crus: FrascoCru[], reenvasados: FrascoPasteurizado[]): SaldoReenvase[] {
  return pasteurizacoes.flatMap((p) => {
    const porDoadora = new Map<number, SaldoReenvase>();
    for (const f of crus.filter((c) => c.pasteurizacao_id === p.id)) {
      const atual = porDoadora.get(f.doadora_id) ?? { pasteurizacao: p, id: f.doadora_id, nome: f.doadora_nome, cru: 0, restante: 0, tipos: [] };
      atual.cru += Number(f.volume_ml);
      if (!atual.tipos.includes(f.classificacao)) atual.tipos.push(f.classificacao);
      porDoadora.set(f.doadora_id, atual);
    }
    return Array.from(porDoadora.values()).map((d) => {
      const feito = reenvasados.filter((f) => f.pasteurizacao_id === p.id && f.doadora_id === d.id).reduce((s, f) => s + Number(f.volume), 0);
      return { ...d, restante: Math.max(d.cru - feito, 0) };
    });
  });
}

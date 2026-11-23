"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarCheck, CalendarDays, CheckCircle2, Droplets, History, MapPin, Milk, Phone, Plus, Printer, Trash2, X } from "lucide-react";

import { Aviso } from "@/components/Alert";
import { Botao, classeBotao } from "@/components/Button";
import { Card } from "@/components/Card";
import { Codigo, DataTable, Numero, TextoDuplo } from "@/components/DataTable";
import { EtiquetaLeiteCru } from "@/components/Etiquetas";
import { Campo, Selecao, ValorFixo } from "@/components/Field";
import { FiltroSelecao, Filtros } from "@/components/Filters";
import { ConfirmarModal, FormModal } from "@/components/FormModal";
import { ImpressaoModal, Modal } from "@/components/Modal";
import { useNotificacao } from "@/components/Notificacao";
import { PageHeader } from "@/components/PageHeader";
import { Dado, Dados, FaixaNumeros } from "@/components/InfoGrid";
import { Busca } from "@/components/SearchInput";
import { StatusBadge } from "@/components/StatusBadge";
import { Abas } from "@/components/Tabs";
import { useAgendarVisita, useCancelarVisita, useCriarFrascoCru, useFrascosCrus, useRealizarVisita, useVisitas } from "@/hooks/use-coletas";
import { useDoadoras, useZonas } from "@/hooks/use-doadoras";
import { getAuthenticatedEmployee } from "@/lib/auth";
import { agora, contem, enderecoCompleto, formatarData, hoje, ml, opcoes, rotulo } from "@/lib/format";
import type { DadosFormulario } from "@/lib/form";
import { classificacaoPorParto, dataLocal, diaDeHoje, preEstocagemPorEquipamento, proximasDatasDaZona } from "@/lib/regras";
import type { FrascoCru, Visita } from "@/types/coleta";
import type { Doadora } from "@/types/doadora";

type AbaColeta = "agendadas" | "realizadas" | "aguardando";

const UM_DIA = 86_400_000;
const POR_PAGINA = 10;

function rotuloDia(dia: string): { texto: string; tom: "hoje" | "atrasada" | "normal" } {
  const dataHoje = hoje();
  if (dia === dataHoje) return { texto: "Hoje", tom: "hoje" };
  if (dia === dataLocal(new Date(Date.now() + UM_DIA))) return { texto: "Amanhã", tom: "normal" };
  return { texto: formatarData(dia), tom: dia < dataHoje ? "atrasada" : "normal" };
}

const entregues = (v: Visita) => Number(v.frascos_novos ?? 0) + Number(v.frascos_esterilizados ?? 0);
const recebidos = (v: Visita) => Number(v.frascos_recebidos ?? 0);

function mensagemErro(e: unknown, padrao = "Não foi possível salvar."): string {
  return e instanceof Error ? e.message : padrao;
}

export default function ColetaDomiciliarPage() {
  const visitas = useVisitas();
  const frascos = useFrascosCrus();
  const zonas = useZonas();
  const [aba, setAba] = useState<AbaColeta>("agendadas");
  const [agendando, setAgendando] = useState(false);
  const [registrando, setRegistrando] = useState<Visita | null>(null);
  const [cancelando, setCancelando] = useState<Visita | null>(null);
  const [detalheId, setDetalheId] = useState<number | null>(null);
  const [etiquetaId, setEtiquetaId] = useState<number | null>(null);

  const todasVisitas = useMemo(() => visitas.data ?? [], [visitas.data]);
  const listaFrascos = useMemo(() => frascos.data ?? [], [frascos.data]);
  const etiqueta = listaFrascos.find((f) => f.id === etiquetaId) ?? null;
  const detalhe = todasVisitas.find((v) => v.id === detalheId) ?? null;
  const aguardandoRecepcao = listaFrascos.filter((f) => f.status === "coletado").length;
  const cancelar = useCancelarVisita();
  const opcoesZona = [{ valor: "", texto: "Todas as zonas" }, ...(zonas.data ?? []).map((z) => ({ valor: z.nome, texto: z.nome }))];

  const agendadas = useMemo(
    () => todasVisitas.filter((v) => v.status === "agendada").sort((a, b) => a.data.localeCompare(b.data) || a.id - b.id),
    [todasVisitas],
  );
  const historico = useMemo(
    () => todasVisitas.filter((v) => v.status !== "agendada").sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id),
    [todasVisitas],
  );

  return (
    <main className="flex w-full flex-col gap-5 p-4 sm:p-6">
      <PageHeader
        titulo="Coleta Domiciliar"
        descricao="Agende as visitas pela zona de cada doadora, registre a visita realizada e os frascos de leite cru coletados."
        acao={
          <Botao icone={Plus} onClick={() => setAgendando(true)}>
            Nova Visita
          </Botao>
        }
      />

      <DiasColeta />

      <DoadorasSemVisita visitas={todasVisitas} />

      <Abas<AbaColeta>
        ativa={aba}
        onTrocar={setAba}
        abas={[
          { id: "agendadas", titulo: "Agendadas", icone: CalendarDays, contador: agendadas.length || undefined },
          { id: "realizadas", titulo: "Histórico", icone: History },
          { id: "aguardando", titulo: "Aguardando Recepção", icone: Milk, contador: aguardandoRecepcao || undefined },
        ]}
      />

      {aba === "agendadas" ? (
        <TabelaAgendadas
          visitas={agendadas}
          carregando={visitas.isLoading}
          erro={visitas.error}
          onRegistrar={setRegistrando}
          onCancelar={setCancelando}
          zonas={opcoesZona}
        />
      ) : aba === "realizadas" ? (
        <TabelaHistorico visitas={historico} carregando={visitas.isLoading} erro={visitas.error} onAbrir={setDetalheId} zonas={opcoesZona} />
      ) : (
        <FrascosAguardando
          frascos={listaFrascos.filter((f) => f.status === "coletado")}
          carregando={frascos.isLoading}
          erro={frascos.error}
          onEtiqueta={setEtiquetaId}
        />
      )}

      {agendando ? <ModalAgendar onFechar={() => setAgendando(false)} /> : null}
      {registrando ? <ModalRegistrarVisita visita={registrando} onFechar={() => setRegistrando(null)} /> : null}
      {cancelando ? (
        <ConfirmarModal
          titulo="Cancelar visita?"
          botao="Cancelar Visita"
          mensagemSucesso="Visita cancelada."
          onConfirmar={() => cancelar.mutateAsync(cancelando.id)}
          onFechar={() => setCancelando(null)}
        >
          <p>
            A visita de <strong>{cancelando.doadora_nome}</strong> em <strong>{formatarData(cancelando.data)}</strong> ({cancelando.zona_nome}) será cancelada e
            irá para o histórico.
          </p>
        </ConfirmarModal>
      ) : null}
      {detalhe ? (
        <ModalDetalheVisita
          visita={detalhe}
          visitas={todasVisitas}
          frascos={listaFrascos}
          onTrocar={setDetalheId}
          onEtiqueta={setEtiquetaId}
          onFechar={() => setDetalheId(null)}
        />
      ) : null}
      {etiqueta ? (
        <ImpressaoModal titulo={`Etiqueta do frasco nº ${etiqueta.id}`} onFechar={() => setEtiquetaId(null)}>
          <EtiquetaLeiteCru frasco={etiqueta} />
        </ImpressaoModal>
      ) : null}
    </main>
  );
}

function DiasColeta() {
  const zonas = useZonas();
  const hojeDia = diaDeHoje();

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex flex-wrap items-center gap-2 px-5 py-2.5">
        <span className="mr-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Dias de coleta:
        </span>
        {(zonas.data ?? []).map((z) => {
          const ehHoje = z.dia_da_semana === hojeDia;
          return (
            <span
              key={z.id}
              className={`rounded-full border px-3 py-1 text-sm ${
                ehHoje ? "border-primary bg-primary font-semibold text-primary-foreground" : "border-border bg-surface text-foreground"
              }`}
            >
              {rotulo(z.dia_da_semana)} · {z.nome}
              {ehHoje ? " · hoje" : ""}
            </span>
          );
        })}
      </div>
    </section>
  );
}

function DoadorasSemVisita({ visitas }: { visitas: Visita[] }) {
  const doadoras = useDoadoras();
  const agendar = useAgendarVisita();
  const notificar = useNotificacao();
  const [agendando, setAgendando] = useState(false);
  const [erro, setErro] = useState("");

  const hojeDia = diaDeHoje();
  const dataHoje = hoje();
  const comVisitaHoje = new Set(visitas.filter((v) => v.status !== "cancelada" && v.data.slice(0, 10) === dataHoje).map((v) => v.doadora_id));
  const pendentes = (doadoras.data ?? []).filter((d) => d.status === "ativa" && d.dia_da_semana === hojeDia && !comVisitaHoje.has(d.id));

  if (pendentes.length === 0) return null;

  async function agendarTodas() {
    setErro("");
    setAgendando(true);
    let feitas = 0;
    try {
      for (const d of pendentes) {
        await agendar.mutateAsync({ doadora_id: d.id, data: dataHoje });
        feitas += 1;
      }
      notificar(`${feitas} visita${feitas > 1 ? "s" : ""} agendada${feitas > 1 ? "s" : ""} para hoje.`);
    } catch (e) {
      setErro(`${feitas} agendada(s). ${mensagemErro(e, "Não foi possível agendar.")}`);
    } finally {
      setAgendando(false);
    }
  }

  const nomes = pendentes.slice(0, 3).map((d) => d.nome.split(" ")[0]);
  const resto = pendentes.length - nomes.length;

  return (
    <Aviso
      tom="alerta"
      titulo={`${pendentes.length} doadora${pendentes.length > 1 ? "s" : ""} ativa${pendentes.length > 1 ? "s" : ""} da zona de hoje sem visita`}
      acao={
        <Botao pequeno icone={CalendarCheck} onClick={agendarTodas} disabled={agendando}>
          {agendando ? "Agendando…" : "Agendar Todas para Hoje"}
        </Botao>
      }
    >
      {nomes.join(", ")}
      {resto > 0 ? ` e mais ${resto}` : ""}. {erro ? <span className="text-danger">{erro}</span> : null}
    </Aviso>
  );
}

function TabelaAgendadas({
  visitas,
  carregando,
  erro,
  onRegistrar,
  onCancelar,
  zonas,
}: {
  visitas: Visita[];
  carregando: boolean;
  erro: Error | null;
  onRegistrar: (v: Visita) => void;
  onCancelar: (v: Visita) => void;
  zonas: { valor: string; texto: string }[];
}) {
  const [busca, setBusca] = useState("");
  const [periodo, setPeriodo] = useState<string>("todas");
  const [zona, setZona] = useState("");

  const dataHoje = hoje();
  const limite7 = dataLocal(new Date(Date.now() + 7 * UM_DIA));
  const noPeriodo = (v: Visita, p: string) => {
    const dia = v.data.slice(0, 10);
    return p === "todas" || (p === "hoje" && dia === dataHoje) || (p === "7" && dia >= dataHoje && dia <= limite7) || (p === "atrasadas" && dia < dataHoje);
  };
  const base = visitas.filter((v) => (!zona || v.zona_nome === zona) && contem(v.doadora_nome, busca));
  const filtradas = base.filter((v) => noPeriodo(v, periodo));

  return (
    <Card
      tabela
      filtros={
        <>
          <Busca valor={busca} onMudar={setBusca} placeholder="Buscar por doadora" />
          <FiltroSelecao rotulo="Filtrar por zona" valor={zona} onMudar={setZona} opcoes={zonas} />
          <div className="lg:ml-auto">
            <Filtros
              ativo={periodo}
              onTrocar={setPeriodo}
              opcoes={[
                { valor: "todas", texto: "Todas", total: base.length },
                { valor: "hoje", texto: "Hoje", total: base.filter((v) => noPeriodo(v, "hoje")).length },
                { valor: "7", texto: "Próx. 7 dias", total: base.filter((v) => noPeriodo(v, "7")).length },
                { valor: "atrasadas", texto: "Atrasadas", total: base.filter((v) => noPeriodo(v, "atrasadas")).length },
              ]}
            />
          </div>
        </>
      }
    >
      <DataTable
        carregando={carregando}
        erro={erro}
        itens={filtradas}
        porPagina={POR_PAGINA}
        vazio={visitas.length ? "Nenhuma visita agendada com esses filtros." : "Nenhuma visita agendada. Use “Nova Visita” no topo da página."}
        colunas={[
          {
            titulo: "Data",
            valor: (v) => {
              const dia = rotuloDia(v.data.slice(0, 10));
              return (
                <span className="flex flex-col whitespace-nowrap">
                  <span className={`font-semibold ${dia.tom === "hoje" ? "text-primary" : dia.tom === "atrasada" ? "text-danger" : "text-foreground"}`}>
                    {dia.texto}
                  </span>
                  {dia.tom === "atrasada" ? <span className="text-xs font-medium text-danger">Atrasada</span> : null}
                </span>
              );
            },
          },
          {
            titulo: "Doadora",
            valor: (v) => (
              <span className="flex flex-col">
                <span className="font-semibold text-foreground">{v.doadora_nome}</span>
                {v.telefone ? <span className="text-xs text-muted-foreground">{v.telefone}</span> : null}
              </span>
            ),
          },
          { titulo: "Zona", valor: (v) => v.zona_nome },
          {
            titulo: "Endereço",
            valor: (v) => (
              <span className="line-clamp-2 min-w-48 text-muted-foreground">{enderecoCompleto(v.endereco_rua, v.endereco_numero, v.endereco_bairro)}</span>
            ),
          },
          {
            titulo: "Ações",
            direita: true,
            valor: (v) => (
              <span className="inline-flex gap-2">
                <Botao
                  pequeno
                  icone={CheckCircle2}
                  onClick={() => onRegistrar(v)}
                  disabled={v.data.slice(0, 10) > dataHoje}
                  title={v.data.slice(0, 10) > dataHoje ? "A visita só pode ser registrada a partir do dia dela." : undefined}
                >
                  Registrar Visita Realizada
                </Botao>
                <Botao pequeno variante="perigo" icone={X} onClick={() => onCancelar(v)}>
                  Cancelar Visita
                </Botao>
              </span>
            ),
          },
        ]}
      />
    </Card>
  );
}

function TabelaHistorico({
  visitas,
  carregando,
  erro,
  onAbrir,
  zonas,
}: {
  visitas: Visita[];
  carregando: boolean;
  erro: Error | null;
  onAbrir: (id: number) => void;
  zonas: { valor: string; texto: string }[];
}) {
  const [busca, setBusca] = useState("");
  const [periodo, setPeriodo] = useState("todas");
  const [zona, setZona] = useState("");
  const [situacao, setSituacao] = useState("todas");

  const limite = periodo === "todas" ? "" : dataLocal(new Date(Date.now() - Number(periodo) * UM_DIA));
  const base = visitas.filter((v) => (!limite || v.data.slice(0, 10) >= limite) && (!zona || v.zona_nome === zona) && contem(v.doadora_nome, busca));
  const filtradas = base.filter((v) => situacao === "todas" || v.status === situacao);
  const total = (status: string) => base.filter((v) => v.status === status).length;

  return (
    <Card
      tabela
      filtros={
        <>
          <Busca valor={busca} onMudar={setBusca} placeholder="Buscar por doadora" />
          <FiltroSelecao rotulo="Filtrar por zona" valor={zona} onMudar={setZona} opcoes={zonas} />
          <FiltroSelecao
            rotulo="Filtrar por período"
            valor={periodo}
            onMudar={setPeriodo}
            opcoes={[
              { valor: "todas", texto: "Todo o período" },
              { valor: "7", texto: "Últimos 7 dias" },
              { valor: "30", texto: "Últimos 30 dias" },
            ]}
          />
          <div className="lg:ml-auto">
            <Filtros
              ativo={situacao}
              onTrocar={setSituacao}
              opcoes={[
                { valor: "todas", texto: "Todas", total: base.length },
                { valor: "realizada", texto: "Realizadas", total: total("realizada") },
                { valor: "cancelada", texto: "Canceladas", total: total("cancelada") },
              ]}
            />
          </div>
        </>
      }
    >
      <DataTable
        carregando={carregando}
        erro={erro}
        itens={filtradas}
        porPagina={POR_PAGINA}
        vazio="Nenhuma visita no histórico com esses filtros."
        aoClicar={(v) => onAbrir(v.id)}
        colunas={[
          { titulo: "Data", valor: (v) => formatarData(v.data) },
          {
            titulo: "Doadora",
            valor: (v) => <span className={`font-semibold ${v.status === "cancelada" ? "text-muted-foreground" : "text-foreground"}`}>{v.doadora_nome}</span>,
          },
          { titulo: "Zona", valor: (v) => v.zona_nome },
          { titulo: "Situação", valor: (v) => <StatusBadge status={v.status} /> },
          { titulo: "Entregues", direita: true, valor: (v) => (v.status === "realizada" ? <Numero>{entregues(v)}</Numero> : "—") },
          { titulo: "Recebidos", direita: true, valor: (v) => (v.status === "realizada" ? <Numero>{recebidos(v)}</Numero> : "—") },
          {
            titulo: "Leite cru",
            direita: true,
            valor: (v) => {
              const quant = Number(v.quant_frascos);
              if (v.status !== "realizada") return "—";
              if (!quant) return <span className="text-muted-foreground">Sem frascos</span>;
              return (
                <span className="whitespace-nowrap tabular-nums">
                  <strong>{ml(v.volume_doado)}</strong>
                  <span className="text-muted-foreground">
                    {" "}
                    · {quant} frasco{quant > 1 ? "s" : ""}
                  </span>
                </span>
              );
            },
          },
          { titulo: "Responsável", valor: (v) => (v.status === "realizada" ? v.funcionario_nome || "—" : "—") },
        ]}
      />
    </Card>
  );
}

function opcoesDoadoras(lista: Doadora[]) {
  return lista
    .filter((d) => d.status === "ativa" || d.status === "em_triagem")
    .map((d) => ({ valor: d.id, texto: `${d.nome} · ${d.zona_nome} (${rotulo(d.dia_da_semana)}) · ${rotulo(d.status)}` }));
}

function ModalAgendar({ onFechar }: { onFechar: () => void }) {
  const doadoras = useDoadoras();
  const agendar = useAgendarVisita();
  const [doadoraId, setDoadoraId] = useState("");

  const doadora = (doadoras.data ?? []).find((x) => String(x.id) === doadoraId);
  const datas = doadora ? proximasDatasDaZona(doadora.dia_da_semana) : [];

  return (
    <FormModal
      titulo="Nova Visita"
      descricao="Cada zona é visitada num dia fixo da semana: as datas disponíveis são as do dia da zona da doadora."
      botao="Agendar Visita"
      mensagemSucesso="Visita agendada."
      grade={false}
      onFechar={onFechar}
      onSubmit={agendar.mutateAsync}
    >
      <div
        className="grid gap-4"
        onChange={(e) => {
          const alvo = e.target as HTMLSelectElement;
          if (alvo.name === "doadora_id") setDoadoraId(alvo.value);
        }}
      >
        <Selecao label="Doadora" name="doadora_id" required opcoes={opcoesDoadoras(doadoras.data ?? [])} />
        <Selecao
          key={doadoraId}
          label="Data da visita"
          name="data"
          required
          defaultValue={datas[0]}
          ajuda={doadora ? `${doadora.zona_nome}: visitas às ${rotulo(doadora.dia_da_semana).toLowerCase()}s.` : "Escolha a doadora primeiro."}
          opcoes={datas.map((d) => ({ valor: d, texto: `${formatarData(d)}${d === hoje() ? " (hoje)" : ""}` }))}
        />
      </div>
    </FormModal>
  );
}

const CAMPOS_FRASCO = ["data_hora_primeira_coleta", "volume_ml", "forma_extracao", "cond_prestocagem", "estado", "data", "responsavel"] as const;

function ModalRegistrarVisita({ visita, onFechar }: { visita: Visita; onFechar: () => void }) {
  const realizar = useRealizarVisita(visita.id);
  const criarFrasco = useCriarFrascoCru();
  const notificar = useNotificacao();
  const [frascos, setFrascos] = useState<number[]>([]);
  const [proximo, setProximo] = useState(1);
  const [salvos, setSalvos] = useState<number[]>([]);
  const [visitaSalva, setVisitaSalva] = useState(false);

  const dia = visita.data.slice(0, 10);
  const podeDoar = visita.doadora_status === "ativa";
  const endereco = enderecoCompleto(visita.endereco_rua, visita.endereco_numero, visita.endereco_bairro);
  const pendentes = frascos.filter((k) => !salvos.includes(k));

  function adicionar() {
    setFrascos((lista) => [...lista, proximo]);
    setProximo((n) => n + 1);
  }

  async function salvar(dados: DadosFormulario) {
    let salvouVisita = visitaSalva;
    const jaSalvos = [...salvos];
    try {
      if (!salvouVisita) {
        await realizar.mutateAsync({
          data: dia,
          data_coleta_sangue: String(dados.data_coleta_sangue ?? ""),
          frascos_novos: 0,
          frascos_esterilizados: Number(dados.frascos_entregues || 0),
          frascos_recebidos: frascos.length,
        });
        salvouVisita = true;
        setVisitaSalva(true);
      }
      for (const k of frascos) {
        if (jaSalvos.includes(k)) continue;
        const frasco: Record<string, string> = { visita_coleta_id: String(visita.id) };
        for (const campo of CAMPOS_FRASCO) frasco[campo] = String(dados[`f${k}_${campo}`] ?? "");
        await criarFrasco.mutateAsync(frasco);
        jaSalvos.push(k);
        setSalvos([...jaSalvos]);
      }
    } catch (e) {
      if (!salvouVisita) throw e;
      throw new Error(
        `A visita já foi registrada e ${jaSalvos.length} frasco(s) foram salvos, mas um frasco falhou: ${mensagemErro(e)} Corrija e clique em salvar de novo.`,
      );
    }
    const n = jaSalvos.length;
    notificar(n ? `Visita registrada com ${n} frasco${n > 1 ? "s" : ""} de leite cru.` : "Visita registrada no histórico.");
  }

  return (
    <FormModal
      titulo="Registrar Visita Realizada"
      descricao={`${visita.doadora_nome} · ${visita.zona_nome} · visita de ${formatarData(dia)} (${rotulo(visita.dia_da_semana).toLowerCase()})`}
      botao={visitaSalva ? "Salvar Frascos Restantes" : "Salvar Visita"}
      tamanho="lg"
      grade={false}
      mensagemSucesso=""
      onFechar={onFechar}
      onSubmit={salvar}
    >
      <div className="flex flex-wrap gap-x-6 gap-y-1 rounded-lg bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {endereco}
        </span>
        {visita.telefone ? (
          <span className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            {visita.telefone}
          </span>
        ) : null}
      </div>

      {visitaSalva ? (
        <Aviso tom="sucesso" titulo="Visita já registrada">
          Faltam {pendentes.length} frasco{pendentes.length === 1 ? "" : "s"} para salvar.
        </Aviso>
      ) : null}

      <fieldset disabled={visitaSalva} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 disabled:opacity-60">
        <ValorFixo rotulo="Data da visita" valor={formatarData(dia)} ajuda={`Dia da ${visita.zona_nome}.`} />
        <Campo label="Coleta de sangue" name="data_coleta_sangue" type="date" max={hoje()} ajuda="Em branco se não colheu." />
        <Campo label="Frascos entregues" name="frascos_entregues" type="number" min={0} required defaultValue={0} ajuda="Vazios, para a doadora." />
        <ValorFixo rotulo="Frascos recebidos" valor={String(frascos.length)} ajuda="Contados pelos frascos de leite cru abaixo." />
      </fieldset>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-2">
          <div>
            <h3 className="text-base font-semibold text-foreground">Frascos de leite cru</h3>
            <p className="text-sm text-muted-foreground">
              {podeDoar
                ? "Adicione um para cada frasco com leite recebido."
                : "A doadora ainda não está ativa: só é possível registrar leite de doadora ativa."}
            </p>
          </div>
          {podeDoar ? (
            <Botao pequeno variante="secundario" icone={Plus} onClick={adicionar}>
              Adicionar Frasco de Leite Cru
            </Botao>
          ) : null}
        </div>

        {frascos.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-input px-5 py-6 text-center">
            <Droplets className="h-7 w-7 text-muted-foreground/60" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Nenhum frasco de leite cru adicionado.</p>
          </div>
        ) : (
          frascos.map((k, i) => (
            <FormFrasco
              key={k}
              chave={k}
              numero={i + 1}
              salvo={salvos.includes(k)}
              visita={visita}
              onRemover={() => setFrascos((lista) => lista.filter((x) => x !== k))}
            />
          ))
        )}
      </section>
    </FormModal>
  );
}

function FormFrasco({ chave, numero, salvo, visita, onRemover }: { chave: number; numero: number; salvo: boolean; visita: Visita; onRemover: () => void }) {
  const n = (campo: string) => `f${chave}_${campo}`;
  const [primeiraColeta, setPrimeiraColeta] = useState(agora());
  const tipo = classificacaoPorParto(visita.data_parto, primeiraColeta);
  const guardado = preEstocagemPorEquipamento(visita.equipamento_estocagem);

  return (
    <fieldset disabled={salvo} className={`rounded-lg border p-4 ${salvo ? "border-success/40 bg-success/5" : "border-primary/25 bg-primary/[0.03]"}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{numero}</span>
          Frasco de leite cru
          {salvo ? <span className="text-success">· salvo</span> : null}
        </p>
        {!salvo ? (
          <Botao pequeno variante="perigo" icone={Trash2} onClick={onRemover}>
            Remover
          </Botao>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Campo
          label="Data e hora da 1ª coleta"
          name={n("data_hora_primeira_coleta")}
          type="datetime-local"
          required
          defaultValue={primeiraColeta}
          onInput={(e) => setPrimeiraColeta(e.currentTarget.value)}
        />
        <Campo label="Volume (mL)" name={n("volume_ml")} type="number" min={1} required />
        <ValorFixo
          rotulo="Tipo de leite"
          valor={tipo ? rotulo(tipo) : "—"}
          ajuda={visita.data_parto ? `Pelo parto em ${formatarData(visita.data_parto)}.` : "Data do parto não cadastrada."}
        />
        <Selecao label="Forma de extração" name={n("forma_extracao")} required opcoes={opcoes(["manual", "mecanica_manual", "mecanica_eletrica"])} />
        <Selecao
          label="Onde estava guardado"
          name={n("cond_prestocagem")}
          required
          defaultValue={guardado}
          ajuda={visita.equipamento_estocagem ? `Pela triagem: ${rotulo(visita.equipamento_estocagem).toLowerCase()}.` : undefined}
          opcoes={opcoes(["congelador", "freezer"])}
        />
        <Selecao label="Estado do leite" name={n("estado")} required opcoes={opcoes(["refrigerado", "congelado", "misto"])} />
        <Campo label="Data do rótulo" name={n("data")} type="date" required defaultValue={visita.data.slice(0, 10)} />
        <Campo label="Responsável" name={n("responsavel")} required defaultValue={getAuthenticatedEmployee()?.nome} />
      </div>
    </fieldset>
  );
}

function ModalDetalheVisita({
  visita,
  visitas,
  frascos,
  onTrocar,
  onEtiqueta,
  onFechar,
}: {
  visita: Visita;
  visitas: Visita[];
  frascos: FrascoCru[];
  onTrocar: (id: number) => void;
  onEtiqueta: (id: number) => void;
  onFechar: () => void;
}) {
  const daVisita = frascos.filter((f) => f.visita_coleta_id === visita.id);
  const daDoadora = visitas.filter((v) => v.doadora_id === visita.doadora_id).sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id);
  const realizadas = daDoadora.filter((v) => v.status === "realizada");
  const volumeTotal = realizadas.reduce((s, v) => s + Number(v.volume_doado || 0), 0);
  const realizada = visita.status === "realizada";
  const volumeVisita = daVisita.reduce((s, f) => s + Number(f.volume_ml), 0);
  const tiposVisita = Array.from(new Set(daVisita.map((f) => rotulo(f.classificacao)))).join(", ");

  return (
    <Modal
      titulo={visita.doadora_nome}
      descricao={`Visita de ${formatarData(visita.data)} · ${visita.zona_nome} (${rotulo(visita.dia_da_semana)})`}
      tamanho="lg"
      onFechar={onFechar}
    >
      <div className="flex flex-col gap-6 px-5 py-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <StatusBadge status={visita.status} />
          <span>{realizada ? `Registrada por ${visita.funcionario_nome || "—"}` : "Visita cancelada: nenhum frasco foi entregue ou recebido."}</span>
        </div>

        {realizada ? (
          <FaixaNumeros
            itens={[
              { rotulo: "Frascos vazios entregues", valor: entregues(visita), detalhe: "para a doadora encher" },
              { rotulo: "Frascos com leite recebidos", valor: Math.max(daVisita.length, recebidos(visita)), detalhe: "trazidos para o banco" },
              { rotulo: "Leite cru coletado", valor: ml(volumeVisita), detalhe: tiposVisita || "—", tom: "destaque" },
            ]}
          />
        ) : null}

        <div className="rounded-xl border border-border px-5 py-4">
          <Dados>
            <Dado rotulo="Telefone" valor={visita.telefone || "—"} />
            <Dado rotulo="Zona" valor={`${visita.zona_nome} · ${rotulo(visita.dia_da_semana)}`} />
            <Dado
              rotulo="Sangue colhido"
              valor={realizada ? (visita.data_coleta_sangue ? `Sim, em ${formatarData(visita.data_coleta_sangue)}` : "Não") : "—"}
            />
            <Dado rotulo="Data da visita" valor={formatarData(visita.data)} />
            <Dado largo rotulo="Endereço" valor={enderecoCompleto(visita.endereco_rua, visita.endereco_numero, visita.endereco_bairro)} />
          </Dados>
        </div>

        {realizada ? (
          <section className="overflow-hidden rounded-lg border border-border">
            <div className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3">
              <h3 className="text-base font-semibold text-foreground">Frascos de leite cru desta visita</h3>
              <span className="text-sm text-muted-foreground">
                {daVisita.length} frasco{daVisita.length === 1 ? "" : "s"} · {ml(daVisita.reduce((s, f) => s + Number(f.volume_ml), 0))}
              </span>
            </div>
            <DataTable
              itens={daVisita}
              porPagina={5}
              vazio="Nenhum frasco de leite cru nesta visita."
              colunas={[
                { titulo: "Nº", valor: (f) => <Codigo>{f.id}</Codigo> },
                { titulo: "Tipo", valor: (f) => rotulo(f.classificacao) },
                { titulo: "1ª coleta", valor: (f) => formatarData(f.data_hora_primeira_coleta) },
                { titulo: "Extração", valor: (f) => rotulo(f.forma_extracao) },
                { titulo: "Volume", direita: true, valor: (f) => <Numero>{ml(f.volume_ml)}</Numero> },
                { titulo: "Situação", valor: (f) => <StatusBadge status={f.status} texto={f.status === "coletado" ? "Aguardando recepção" : undefined} /> },
                {
                  titulo: "",
                  direita: true,
                  valor: (f) => (
                    <Botao variante="secundario" pequeno icone={Printer} onClick={() => onEtiqueta(f.id)}>
                      Etiqueta
                    </Botao>
                  ),
                },
              ]}
            />
          </section>
        ) : null}

        <section className="overflow-hidden rounded-lg border border-border">
          <div className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3">
            <h3 className="text-base font-semibold text-foreground">Histórico de visitas da doadora</h3>
            <span className="text-sm text-muted-foreground">
              {realizadas.length} realizada{realizadas.length === 1 ? "" : "s"} · {ml(volumeTotal)} doados no total
            </span>
          </div>
          <DataTable
            itens={daDoadora}
            porPagina={5}
            vazio="Nenhuma outra visita."
            aoClicar={(v) => v.id !== visita.id && onTrocar(v.id)}
            destacar={(v) => v.id === visita.id}
            colunas={[
              {
                titulo: "Data",
                valor: (v) => <span className="whitespace-nowrap font-semibold">{formatarData(v.data)}</span>,
              },
              { titulo: "Situação", valor: (v) => <StatusBadge status={v.status} /> },
              { titulo: "Entregues", direita: true, valor: (v) => (v.status === "realizada" ? entregues(v) : "—") },
              { titulo: "Recebidos", direita: true, valor: (v) => (v.status === "realizada" ? recebidos(v) : "—") },
              {
                titulo: "Leite cru",
                direita: true,
                valor: (v) =>
                  v.status === "realizada" ? `${ml(v.volume_doado)} · ${Number(v.quant_frascos)} frasco${Number(v.quant_frascos) === 1 ? "" : "s"}` : "—",
              },
              { titulo: "Responsável", valor: (v) => (v.status === "realizada" ? v.funcionario_nome || "—" : "—") },
            ]}
          />
        </section>
      </div>
    </Modal>
  );
}

function FrascosAguardando({
  frascos,
  carregando,
  erro,
  onEtiqueta,
}: {
  frascos: FrascoCru[];
  carregando: boolean;
  erro: Error | null;
  onEtiqueta: (id: number) => void;
}) {
  const [busca, setBusca] = useState("");
  const visiveis = frascos.filter((f) => contem(f.doadora_nome, busca) || contem(f.id, busca));
  const volume = frascos.reduce((s, f) => s + Number(f.volume_ml), 0);

  return (
    <Card
      titulo="Frascos aguardando recepção"
      descricao={`Recolhidos nas casas e ainda não entregues ao banco de leite · ${frascos.length} frasco${frascos.length === 1 ? "" : "s"} · ${ml(volume)}`}
      tabela
      acao={
        <Link href="/recepcao" className={classeBotao("secundario", true)}>
          Ir para Recepção
        </Link>
      }
      filtros={<Busca valor={busca} onMudar={setBusca} placeholder="Buscar por doadora ou nº do frasco" />}
    >
      <DataTable
        carregando={carregando}
        erro={erro}
        itens={visiveis}
        porPagina={POR_PAGINA}
        vazio="Nenhum frasco aguardando recepção."
        colunas={[
          { titulo: "Nº", valor: (f) => <Codigo>{f.id}</Codigo> },
          { titulo: "Doadora", valor: (f) => <TextoDuplo principal={f.doadora_nome} /> },
          { titulo: "1ª coleta", valor: (f) => formatarData(f.data_hora_primeira_coleta) },
          { titulo: "Tipo", valor: (f) => rotulo(f.classificacao) },
          { titulo: "Estado", valor: (f) => rotulo(f.estado) },
          { titulo: "Volume", valor: (f) => <Numero>{ml(f.volume_ml)}</Numero>, direita: true },
          {
            titulo: "",
            direita: true,
            valor: (f) => (
              <Botao variante="secundario" pequeno icone={Printer} onClick={() => onEtiqueta(f.id)}>
                Etiqueta
              </Botao>
            ),
          },
        ]}
      />
    </Card>
  );
}

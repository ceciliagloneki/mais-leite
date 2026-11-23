"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import {
  Baby,
  Cigarette,
  ClipboardList,
  FileText,
  HeartPulse,
  House,
  LoaderCircle,
  MapPin,
  Pencil,
  Snowflake,
  Stethoscope,
  Syringe,
  TestTube,
  User,
} from "lucide-react";

import { Aviso } from "@/components/Alert";
import { Botao, classeBotao } from "@/components/Button";
import { Card } from "@/components/Card";
import { DoadoraFormFields } from "@/components/DoadoraFormFields";
import { Campo, CamposCompactos, Marcar, Selecao, SimNao } from "@/components/Field";
import { useNotificacao } from "@/components/Notificacao";
import { FormCard } from "@/components/FormCard";
import { PassoLinhaDoTempo } from "@/components/LinhaDoTempo";
import { BlocoInfo, DadoDestaque, GradeBlocos, ItemInfo, LinhaInfo, PainelInfo, SecaoInfo } from "@/components/InfoGrid";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Abas } from "@/components/Tabs";
import { useVisitas } from "@/hooks/use-coletas";
import { useDoadora, useEditarDoadora, useRegistrarSorologia, useRegistrarTriagem, useZonas } from "@/hooks/use-doadoras";
import { anosDesde, enderecoCompleto, formatarCartaoSus, formatarData, hoje, idadeBebe, opcoes, rotulo, simNao } from "@/lib/format";
import { lerFormulario, type DadosFormulario } from "@/lib/form";
import type { DoadoraDetalhe } from "@/types/doadora";

type AbaDoadora = "triagem" | "sorologia" | "ficha";

export default function DoadoraDetalhePage() {
  const id = Number(useParams<{ id: string }>().id);
  const { data: doadora, isLoading, error } = useDoadora(id);

  if (isLoading) {
    return (
      <main className="flex items-center gap-3 p-8 text-lg text-muted-foreground">
        <LoaderCircle className="h-6 w-6 animate-spin" aria-hidden="true" /> Carregando ficha…
      </main>
    );
  }
  if (error || !doadora) {
    return (
      <main className="flex flex-col gap-4 p-8">
        <Aviso tom="perigo" titulo="Não foi possível abrir a ficha.">
          {error?.message ?? "Doadora não encontrada."}
        </Aviso>
        <Link href="/doadoras" className={classeBotao("secundario")}>
          Voltar para a Lista
        </Link>
      </main>
    );
  }

  return <FichaDoadora doadora={doadora} />;
}

function FichaDoadora({ doadora }: { doadora: DoadoraDetalhe }) {
  const t = doadora.triagem;
  const primeiraNormal = doadora.sorologias.some((s) => s.numero_amostra === 1 && s.resultado === "normal");
  const [aba, setAba] = useState<AbaDoadora>(!t ? "triagem" : doadora.status === "em_triagem" ? "sorologia" : "ficha");

  return (
    <main className="flex w-full flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5">
      <PageHeader
        voltar={{ href: "/doadoras", texto: "Voltar para a Lista" }}
        titulo={
          <span className="flex flex-wrap items-center gap-3">
            {doadora.nome}
            <StatusBadge status={doadora.status} />
          </span>
        }
        descricao={`Doadora nº ${doadora.id} · cadastrada em ${formatarData(doadora.data_cad)}`}
      />

      <ProximoPasso doadora={doadora} primeiraNormal={primeiraNormal} irPara={setAba} />

      <ResumoDoadora doadora={doadora} />

      <Abas<AbaDoadora>
        ativa={aba}
        onTrocar={setAba}
        abas={[
          { id: "triagem", titulo: "Triagem", icone: ClipboardList, contador: t ? undefined : 1 },
          { id: "sorologia", titulo: "Sorologia", icone: TestTube },
          { id: "ficha", titulo: "Ficha Completa", icone: FileText },
        ]}
      />

      {aba === "triagem" ? <AbaTriagem doadora={doadora} /> : null}
      {aba === "sorologia" ? <AbaSorologia doadora={doadora} /> : null}
      {aba === "ficha" ? <AbaFicha doadora={doadora} irPara={setAba} /> : null}
    </main>
  );
}

function ResumoDoadora({ doadora }: { doadora: DoadoraDetalhe }) {
  const idade = anosDesde(doadora.data_nasc);
  const bebe = idadeBebe(doadora.data_parto);
  const endereco = enderecoCompleto(doadora.endereco_rua, doadora.endereco_numero, doadora.endereco_bairro);

  return (
    <GradeBlocos>
      <BlocoInfo icone={User} titulo="Mãe">
        <ItemInfo rotulo="Cartão SUS" valor={formatarCartaoSus(doadora.cartao_sus)} numerico />
        <ItemInfo rotulo="Telefone" valor={doadora.telefone || "—"} numerico />
        <ItemInfo rotulo="Nascimento" valor={formatarData(doadora.data_nasc)} numerico />
        <ItemInfo rotulo="Idade" valor={idade !== null ? `${idade} anos` : "—"} />
      </BlocoInfo>

      <BlocoInfo icone={Baby} titulo="Bebê">
        <ItemInfo rotulo="Nome" valor={doadora.nome_bebe || "—"} largo />
        <ItemInfo rotulo="Data do parto" valor={formatarData(doadora.data_parto)} numerico />
        <ItemInfo rotulo="Idade" valor={bebe || "—"} />
      </BlocoInfo>

      <BlocoInfo icone={MapPin} titulo="Coleta Domiciliar">
        <ItemInfo rotulo="Zona" valor={doadora.zona_nome} />
        <ItemInfo rotulo="Dia da busca" valor={rotulo(doadora.dia_da_semana)} />
        <ItemInfo rotulo="Endereço" valor={endereco} largo />
      </BlocoInfo>
    </GradeBlocos>
  );
}

function ProximoPasso({ doadora, primeiraNormal, irPara }: { doadora: DoadoraDetalhe; primeiraNormal: boolean; irPara: (aba: AbaDoadora) => void }) {
  if (doadora.status === "removida") {
    return (
      <Aviso tom="perigo" titulo="Doadora removida do programa">
        Uma sorologia deu alterada. O leite dela que ainda não foi entregue foi bloqueado ou descartado.
      </Aviso>
    );
  }
  if (doadora.status === "inapta") {
    return (
      <Aviso tom="perigo" titulo="Doadora inapta">
        A triagem não ficou conforme. Ela não pode doar leite.
      </Aviso>
    );
  }
  if (!doadora.triagem) {
    return (
      <Aviso
        tom="alerta"
        titulo="Próximo passo: registrar a triagem"
        acao={
          <Botao pequeno onClick={() => irPara("triagem")}>
            Registrar Triagem
          </Botao>
        }
      >
        Preencha o funil de segurança da primeira visita.
      </Aviso>
    );
  }
  if (!primeiraNormal) {
    return (
      <Aviso
        tom="alerta"
        titulo="Próximo passo: registrar a 1ª amostra de sorologia"
        acao={
          <Botao pequeno onClick={() => irPara("sorologia")}>
            Registrar Sorologia
          </Botao>
        }
      >
        Ela fica <strong>ativa</strong> quando a 1ª amostra der normal.
      </Aviso>
    );
  }
  return (
    <Aviso
      tom="sucesso"
      titulo="Doadora ativa — pode doar leite"
      acao={
        <Link href="/coleta-domiciliar" className={classeBotao("secundario", true)}>
          Ir para Coleta Domiciliar
        </Link>
      }
    >
      Agende as visitas de coleta pela zona dela ({doadora.zona_nome}, {rotulo(doadora.dia_da_semana)}).
    </Aviso>
  );
}

function AbaTriagem({ doadora }: { doadora: DoadoraDetalhe }) {
  const triagem = useRegistrarTriagem(doadora.id);
  const t = doadora.triagem;

  if (!t) {
    return (
      <FormCard
        titulo="Funil de Segurança"
        descricao="Siga as etapas na ordem e marque apenas o que se aplica à doadora."
        botao="Salvar Triagem"
        mensagemSucesso="Triagem registrada."
        onSubmit={triagem.mutateAsync}
        rodape={
          <label className="flex items-center justify-between gap-3 sm:justify-start">
            <span className="text-sm font-medium text-foreground">
              Data da triagem
              <span className="ml-0.5 text-danger" aria-hidden="true">
                {" "}
                *
              </span>
            </span>
            <input
              name="data_triagem"
              type="date"
              required
              defaultValue={hoje()}
              className="h-10 rounded-lg border border-input bg-surface px-3 text-sm tabular-nums text-foreground"
            />
          </label>
        }
      >
        <div className="col-span-full flex flex-col pt-1">
          <PassoLinhaDoTempo numero={1} titulo="Dados Socioeconômicos e Pré-Natal">
            <div className="grid gap-4 lg:grid-cols-3">
              <CaixaFunil titulo="Condição de Moradia">
                <Marcar label="Tem água potável" name="agua_potavel" />
                <Marcar label="Tem rede de esgoto" name="esgoto" />
                <Campo label="Renda familiar (R$)" name="renda" type="number" min={0} />
              </CaixaFunil>
              <CaixaFunil titulo="Intercorrências na Gestação">
                <Marcar label="Infecção urinária" name="infeccao_urinaria" />
                <Marcar label="Hipertensão (pressão alta)" name="hipertensao" />
                <Marcar label="Diabetes" name="diabetes" />
                <Marcar label="Hepatite" name="hepatite" />
              </CaixaFunil>
              <CaixaFunil titulo="Dados do Bebê">
                <Campo label="Apgar (0 a 10)" name="apgar_bebe" type="number" min={0} max={10} />
                <Campo label="Peso ao nascer (gramas)" name="peso_bebe" type="number" min={0} />
                <Marcar label="Bebê tem malformação" name="malformacao_bebe" />
              </CaixaFunil>
            </div>
          </PassoLinhaDoTempo>

          <PassoLinhaDoTempo numero={2} titulo="Cadeia de Frios Residencial" descricao="Inspeção de onde o leite fica guardado em casa.">
            <CaixaFunil>
              <div className="grid gap-4 sm:grid-cols-2">
                <Selecao label="Equipamento" name="equipamento_estocagem" required opcoes={opcoes(["freezer", "refrigerador", "duplex"])} />
                <Campo label="Produtos guardados junto ao leite" name="produtos_junto_leite" placeholder="Ex.: carnes, verduras" />
              </div>
            </CaixaFunil>
          </PassoLinhaDoTempo>

          <PassoLinhaDoTempo
            numero={3}
            titulo="Parecer da Triagem"
            descricao="Conforme nas etapas 1 e 2, a doadora segue para a coleta de sangue (1ª, 2ª e 3ª amostra) na aba Sorologia."
            ultima
          >
            <CaixaFunil>
              <SimNao
                label="A doadora passou nas etapas 1 e 2?"
                name="conforme"
                required
                textoSim="Sim, conforme — seguir para a sorologia"
                textoNao="Não conforme (doadora inapta)"
              />
            </CaixaFunil>
          </PassoLinhaDoTempo>
        </div>
      </FormCard>
    );
  }

  const amostra = (n: number) => doadora.sorologias.find((s) => s.numero_amostra === n);

  return (
    <Card
      titulo="Funil de Segurança"
      descricao={`Registrado em ${formatarData(t.data_triagem)}`}
      acao={<StatusBadge status={Number(t.conforme) ? "conforme" : "inapta"} texto={Number(t.conforme) ? "Conforme" : "Não conforme"} />}
    >
      <PassoLinhaDoTempo numero={1} titulo="Dados Socioeconômicos e Pré-Natal">
        <div className="grid gap-4 lg:grid-cols-3">
          <CaixaFunil titulo="Condição de Moradia">
            <DadoDestaque rotulo="Água potável" valor={simNao(t.agua_potavel)} alerta={!Number(t.agua_potavel)} />
            <DadoDestaque rotulo="Rede de esgoto" valor={simNao(t.esgoto)} alerta={!Number(t.esgoto)} />
            <DadoDestaque rotulo="Renda familiar" valor={t.renda ? `R$ ${t.renda}` : "—"} />
          </CaixaFunil>
          <CaixaFunil titulo="Intercorrências na Gestação">
            <DadoDestaque rotulo="Infecção urinária" valor={simNao(t.infeccao_urinaria)} alerta={!!Number(t.infeccao_urinaria)} />
            <DadoDestaque rotulo="Hipertensão" valor={simNao(t.hipertensao)} alerta={!!Number(t.hipertensao)} />
            <DadoDestaque rotulo="Diabetes" valor={simNao(t.diabetes)} alerta={!!Number(t.diabetes)} />
            <DadoDestaque rotulo="Hepatite" valor={simNao(t.hepatite)} alerta={!!Number(t.hepatite)} />
          </CaixaFunil>
          <CaixaFunil titulo="Dados do Bebê">
            <DadoDestaque rotulo="Apgar" valor={t.apgar_bebe ?? "—"} />
            <DadoDestaque rotulo="Peso ao nascer" valor={t.peso_bebe ? `${t.peso_bebe} g` : "—"} />
            <DadoDestaque rotulo="Malformação" valor={simNao(t.malformacao_bebe)} alerta={!!Number(t.malformacao_bebe)} />
          </CaixaFunil>
        </div>
      </PassoLinhaDoTempo>

      <PassoLinhaDoTempo numero={2} titulo="Cadeia de Frios Residencial" descricao="Inspeção de onde o leite fica guardado em casa.">
        <div className="grid gap-3 sm:grid-cols-2">
          <DadoDestaque rotulo="Equipamento" valor={rotulo(t.equipamento_estocagem)} />
          <DadoDestaque rotulo="Produtos junto ao leite" valor={t.produtos_junto_leite || "Nenhum"} />
        </div>
      </PassoLinhaDoTempo>

      <PassoLinhaDoTempo
        numero={3}
        titulo="Sorologia"
        descricao="Coleta de sangue da doadora (1ª, 2ª e 3ª amostra)."
        ultima
        pendente={doadora.sorologias.length === 0}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((n) => {
            const s = amostra(n);
            return (
              <div key={n} className="flex items-center justify-between gap-3 rounded-lg bg-muted/70 px-4 py-3">
                <span className="text-base text-foreground">
                  {n}ª amostra
                  {s ? <span className="ml-2 text-sm tabular-nums text-muted-foreground">{formatarData(s.data_coleta)}</span> : null}
                </span>
                {s ? <StatusBadge status={s.resultado} /> : <span className="text-sm font-medium text-muted-foreground">Aguardando</span>}
              </div>
            );
          })}
        </div>
      </PassoLinhaDoTempo>
    </Card>
  );
}

function AbaSorologia({ doadora }: { doadora: DoadoraDetalhe }) {
  const amostra = (n: number) => doadora.sorologias.find((s) => s.numero_amostra === n);
  const encerrada = doadora.status === "removida" || doadora.status === "inapta";
  const proxima = encerrada ? null : ([1, 2, 3].find((n) => !amostra(n)) ?? null);
  const visitas = useVisitas();
  const usadas = new Set(doadora.sorologias.map((s) => s.data_coleta.slice(0, 10)));
  const sangueNaVisita = (visitas.data ?? [])
    .filter((v) => v.doadora_id === doadora.id && v.status === "realizada" && v.data_coleta_sangue)
    .map((v) => v.data_coleta_sangue!.slice(0, 10))
    .filter((d) => !usadas.has(d))
    .sort()[0];

  return (
    <Card titulo="Sorologia" descricao="Registre as amostras em ordem; cada uma libera a seguinte. Amostra alterada deixa a doadora inapta.">
      <div className="grid gap-4 lg:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <AmostraSorologia
            key={n}
            doadora={doadora}
            numero={n}
            amostra={amostra(n)}
            liberada={n === proxima}
            sangueNaVisita={n === proxima ? sangueNaVisita : undefined}
            motivoBloqueio={encerrada ? "Bloqueada: a doadora está inapta." : `Liberada depois da ${n - 1}ª amostra.`}
          />
        ))}
      </div>
    </Card>
  );
}

function useFormularioRapido(enviar: (dados: DadosFormulario) => Promise<unknown>, sucesso: string) {
  const notificar = useNotificacao();
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      await enviar(lerFormulario(event.currentTarget));
      notificar(sucesso);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return { onSubmit, erro, salvando };
}

function AmostraSorologia({
  doadora,
  numero,
  amostra,
  liberada,
  motivoBloqueio,
  sangueNaVisita,
}: {
  sangueNaVisita?: string;
  doadora: DoadoraDetalhe;
  numero: number;
  amostra?: DoadoraDetalhe["sorologias"][number];
  liberada: boolean;
  motivoBloqueio: string;
}) {
  const sorologia = useRegistrarSorologia(doadora.id);
  const form = useFormularioRapido(sorologia.mutateAsync, `${numero}ª amostra registrada.`);

  if (amostra) {
    const alterada = amostra.resultado === "alterado";
    return (
      <div className={`flex flex-col gap-3 rounded-xl border-2 p-4 ${alterada ? "border-danger/40 bg-danger/5" : "border-success/30 bg-success/5"}`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{numero}ª Amostra</h3>
          <StatusBadge status={amostra.resultado} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Data da coleta do sangue</p>
          <p className="mt-0.5 text-base font-semibold tabular-nums text-foreground">{formatarData(amostra.data_coleta)}</p>
        </div>
        {alterada ? <p className="text-sm font-medium text-danger">Resultado alterado: a doadora ficou inapta e o leite dela foi bloqueado.</p> : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={form.onSubmit}
      className={`flex flex-col rounded-xl border-2 p-4 transition-opacity ${liberada ? "border-primary/40 bg-surface" : "border-border bg-muted/20 opacity-50"}`}
    >
      <fieldset disabled={!liberada || form.salvando} className="flex flex-1 flex-col gap-3">
        <div className="flex min-h-7 items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{numero}ª Amostra</h3>
          {!liberada ? <span className="text-xs font-medium text-muted-foreground">{motivoBloqueio}</span> : null}
        </div>
        <input type="hidden" name="numero_amostra" value={numero} />
        <CamposCompactos.Provider value>
          <Campo
            label="Data da coleta do sangue"
            name="data_coleta"
            type="date"
            required
            max={hoje()}
            defaultValue={sangueNaVisita ?? hoje()}
            ajuda={sangueNaVisita ? "Data registrada na visita de coleta domiciliar." : undefined}
          />
          <SimNao label="Resultado" name="resultado" required textoSim="Normal" textoNao="Alterado" valorSim="normal" valorNao="alterado" />
        </CamposCompactos.Provider>
        {form.erro ? (
          <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {form.erro}
          </p>
        ) : null}
        <Botao type="submit" pequeno className="mt-auto w-full">
          {form.salvando ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
          {form.salvando ? "Salvando…" : `Salvar ${numero}ª Amostra`}
        </Botao>
      </fieldset>
    </form>
  );
}

function CaixaFunil({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <div className="grid content-start gap-3 rounded-lg border border-border bg-muted/20 p-4">
      {titulo ? <h4 className="text-sm font-bold uppercase tracking-wider text-primary">{titulo}</h4> : null}
      {children}
    </div>
  );
}

function AbaFicha({ doadora, irPara }: { doadora: DoadoraDetalhe; irPara: (aba: AbaDoadora) => void }) {
  const zonas = useZonas();
  const editar = useEditarDoadora(doadora.id);
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <FormCard
        titulo="Editar Ficha de Identificação"
        botao="Salvar Alterações"
        mensagemSucesso="Ficha atualizada."
        semFechar
        onSubmit={editar.mutateAsync}
        onCancelar={() => setEditando(false)}
        aoSalvar={() => setEditando(false)}
      >
        <DoadoraFormFields zonas={zonas.data ?? []} doadora={doadora} />
      </FormCard>
    );
  }

  const t = doadora.triagem;
  const amostra = (n: number) => doadora.sorologias.find((s) => s.numero_amostra === n);
  const comData = (valor: number, data: string | null) => (Number(valor) ? `Sim${data ? ` · ${formatarData(data)}` : ""}` : "Não");
  const sim = (valor: number | string | null | undefined) => Boolean(Number(valor));

  return (
    <Card
      titulo="Ficha Completa"
      descricao="Identificação, triagem e sorologia da doadora em um só lugar. Itens que pedem atenção aparecem em laranja."
      acao={
        <Botao pequeno variante="secundario" icone={Pencil} onClick={() => setEditando(true)}>
          Editar Ficha
        </Botao>
      }
    >
      <div className="flex flex-col gap-8 pt-4">
        <SecaoInfo titulo="Saúde da Mãe" descricao="Dados da ficha de identificação.">
          <PainelInfo icone={Syringe} titulo="Vacinas em Dia">
            <LinhaInfo rotulo="Febre amarela" valor={simNao(doadora.vacina_febre_amarela)} alerta={!sim(doadora.vacina_febre_amarela)} />
            <LinhaInfo rotulo="dTpa" valor={simNao(doadora.vacina_dtpa)} alerta={!sim(doadora.vacina_dtpa)} />
          </PainelInfo>
          <PainelInfo icone={HeartPulse} titulo="Histórico de Saúde">
            <LinhaInfo
              rotulo="Transfusão de sangue"
              valor={comData(doadora.transfusao_sangue, doadora.data_transfusao)}
              alerta={sim(doadora.transfusao_sangue)}
            />
            <LinhaInfo rotulo="Tatuagem" valor={comData(doadora.tatuagem, doadora.data_tatuagem)} alerta={sim(doadora.tatuagem)} />
          </PainelInfo>
          <PainelInfo icone={Cigarette} titulo="Hábitos">
            <LinhaInfo
              rotulo="Fuma"
              valor={sim(doadora.fumante) ? `Sim${doadora.cigarros_dia ? ` · ${doadora.cigarros_dia}/dia` : ""}` : "Não"}
              alerta={sim(doadora.fumante)}
            />
            <LinhaInfo rotulo="Bebida alcoólica" valor={simNao(doadora.consome_alcool)} alerta={sim(doadora.consome_alcool)} />
            <LinhaInfo rotulo="Remédios em uso" valor={doadora.uso_medicacao || "Nenhum"} />
          </PainelInfo>
        </SecaoInfo>

        <SecaoInfo
          titulo="Triagem"
          descricao={t ? `Funil de segurança registrado em ${formatarData(t.data_triagem)}.` : "Funil de segurança da primeira visita."}
          acao={t ? <StatusBadge status={Number(t.conforme) ? "conforme" : "inapta"} texto={Number(t.conforme) ? "Conforme" : "Não conforme"} /> : null}
        >
          {t ? (
            <>
              <PainelInfo icone={House} titulo="Condição de Moradia">
                <LinhaInfo rotulo="Água potável" valor={simNao(t.agua_potavel)} alerta={!sim(t.agua_potavel)} />
                <LinhaInfo rotulo="Rede de esgoto" valor={simNao(t.esgoto)} alerta={!sim(t.esgoto)} />
                <LinhaInfo rotulo="Renda familiar" valor={t.renda ? `R$ ${t.renda}` : "—"} />
              </PainelInfo>
              <PainelInfo icone={Stethoscope} titulo="Intercorrências na Gestação">
                <LinhaInfo rotulo="Infecção urinária" valor={simNao(t.infeccao_urinaria)} alerta={sim(t.infeccao_urinaria)} />
                <LinhaInfo rotulo="Hipertensão" valor={simNao(t.hipertensao)} alerta={sim(t.hipertensao)} />
                <LinhaInfo rotulo="Diabetes" valor={simNao(t.diabetes)} alerta={sim(t.diabetes)} />
                <LinhaInfo rotulo="Hepatite" valor={simNao(t.hepatite)} alerta={sim(t.hepatite)} />
              </PainelInfo>
              <PainelInfo icone={Baby} titulo="Dados do Bebê">
                <LinhaInfo rotulo="Apgar" valor={t.apgar_bebe ?? "—"} />
                <LinhaInfo rotulo="Peso ao nascer" valor={t.peso_bebe ? `${t.peso_bebe} g` : "—"} />
                <LinhaInfo rotulo="Malformação" valor={simNao(t.malformacao_bebe)} alerta={sim(t.malformacao_bebe)} />
              </PainelInfo>
            </>
          ) : (
            <FichaVazia texto="A triagem ainda não foi registrada." acao="Registrar Triagem" onAcao={() => irPara("triagem")} />
          )}
        </SecaoInfo>

        <SecaoInfo titulo="Estocagem e Sorologia" descricao="Cadeia de frios em casa e as 3 amostras de sangue.">
          {t ? (
            <PainelInfo icone={Snowflake} titulo="Cadeia de Frios">
              <LinhaInfo rotulo="Equipamento" valor={rotulo(t.equipamento_estocagem)} />
              <LinhaInfo rotulo="Produtos junto ao leite" valor={t.produtos_junto_leite || "Nenhum"} />
            </PainelInfo>
          ) : (
            <PainelInfo icone={Snowflake} titulo="Cadeia de Frios">
              <LinhaInfo rotulo="Equipamento" valor="—" />
              <LinhaInfo rotulo="Produtos junto ao leite" valor="—" />
            </PainelInfo>
          )}
          <PainelInfo icone={TestTube} titulo="Sorologia" classe="lg:col-span-2">
            {[1, 2, 3].map((n) => {
              const s = amostra(n);
              return (
                <LinhaInfo
                  key={n}
                  rotulo={`${n}ª amostra`}
                  valor={
                    s ? (
                      <span className="flex items-center justify-end gap-3">
                        <span className="tabular-nums text-muted-foreground">{formatarData(s.data_coleta)}</span>
                        <StatusBadge status={s.resultado} />
                      </span>
                    ) : (
                      <span className="font-normal text-muted-foreground">Aguardando</span>
                    )
                  }
                />
              );
            })}
          </PainelInfo>
        </SecaoInfo>
      </div>
    </Card>
  );
}

function FichaVazia({ texto, acao, onAcao }: { texto: string; acao: string; onAcao: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-input px-4 py-8 text-center md:col-span-2 lg:col-span-3">
      <p className="text-sm text-muted-foreground">{texto}</p>
      <Botao pequeno variante="secundario" onClick={onAcao}>
        {acao}
      </Botao>
    </div>
  );
}

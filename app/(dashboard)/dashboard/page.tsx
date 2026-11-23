"use client";

import Link from "next/link";
import {
  ArrowRight,
  Baby,
  CheckCheck,
  CheckCircle2,
  ClipboardCheck,
  Droplet,
  FlaskConical,
  Home,
  Microscope,
  Package,
  PackagePlus,
  Truck,
  Undo2,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Indicador } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useVisitas } from "@/hooks/use-coletas";
import { useAlocacoes } from "@/hooks/use-distribuicao";
import { useZonas } from "@/hooks/use-doadoras";
import { usePrescricoes } from "@/hooks/use-hospitais";
import { usePasteurizacoes } from "@/hooks/use-processamento";
import { useDashboard } from "@/hooks/use-relatorios";
import { getAuthenticatedEmployee } from "@/lib/auth";
import { dataPorExtenso, formatarData, hoje, ml, rotulo, saudacao } from "@/lib/format";
import { diaDeHoje, proximasDatasDaZona, somarDias } from "@/lib/regras";

interface Tarefa {
  qtd: number;
  titulo: string;
  detalhe: string;
  href: string;
  icone: LucideIcon;
}

const TIPOS = ["colostro", "transicao", "maduro"] as const;

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();
  const visitas = useVisitas();
  const prescricoes = usePrescricoes();
  const alocacoes = useAlocacoes();
  const pasteurizacoes = usePasteurizacoes();
  const zonas = useZonas();
  const nome = getAuthenticatedEmployee()?.nome?.split(" ")[0];

  const dataHoje = hoje();
  const listaVisitas = visitas.data ?? [];
  const doadoras = (status: string) => Number(data?.doadoras.find((d) => d.status === status)?.total ?? 0);
  const crus = (status: string) => Number(data?.frascos_crus.find((f) => f.status === status)?.total ?? 0);
  const estoque = (status: string, tipo?: string, campo: "total" | "volume" = "volume") =>
    (data?.estoque ?? []).filter((e) => e.status === status && (!tipo || e.classificacao === tipo)).reduce((s, e) => s + Number(e[campo]), 0);

  const falta = (volumePrescrito: string, volumeAlocado: string) => Math.max(Number(volumePrescrito) - Number(volumeAlocado), 0);
  const receitasAbertas = (prescricoes.data ?? []).filter((p) => p.demanda_status === "pendente" && falta(p.volume_prescrito, p.volume_alocado) > 0);
  const necessidade = (tipo: string) =>
    receitasAbertas.filter((p) => p.tipo_leite === tipo).reduce((s, p) => s + falta(p.volume_prescrito, p.volume_alocado), 0);
  const necessidadeTotal = receitasAbertas.reduce((s, p) => s + falta(p.volume_prescrito, p.volume_alocado), 0);

  const realizadas30 = listaVisitas.filter((v) => v.status === "realizada" && v.data.slice(0, 10) >= somarDias(dataHoje, -30));
  const coletado30 = realizadas30.reduce((s, v) => s + Number(v.volume_doado), 0);

  const visitasHoje = listaVisitas.filter((v) => v.status !== "cancelada" && v.data.slice(0, 10) === dataHoje);
  const atrasadas = listaVisitas.filter((v) => v.status === "agendada" && v.data.slice(0, 10) < dataHoje);
  const zonaHoje = (zonas.data ?? []).find((z) => z.dia_da_semana === diaDeHoje());
  const proximaZona = [...(zonas.data ?? [])].sort((a, b) =>
    (proximasDatasDaZona(a.dia_da_semana, 1)[0] ?? "").localeCompare(proximasDatasDaZona(b.dia_da_semana, 1)[0] ?? ""),
  )[0];
  const dataColeta = zonaHoje ? dataHoje : proximaZona ? proximasDatasDaZona(proximaZona.dia_da_semana, 1)[0] : dataHoje;
  const zonaColeta = zonaHoje ?? proximaZona;
  const visitasDaColeta = listaVisitas.filter((v) => v.status !== "cancelada" && v.data.slice(0, 10) === dataColeta);

  const separadosSemFicha = (alocacoes.data ?? []).filter((a) => a.distribuicao_id === null).length;
  const entreguesSemBaixa = (alocacoes.data ?? []).filter((a) => a.distribuicao_id !== null && !a.data_administracao).length;
  const reenvasePendente = (pasteurizacoes.data ?? []).filter((p) => Number(p.volume_cru) - Number(p.volume_reenvasado) > 0).length;
  const frascosADevolver = (data?.devolucoes_pendentes ?? []).reduce((s, d) => s + Number(d.faltam), 0);
  const visitasParaRegistrar = visitasHoje.filter((v) => v.status === "agendada").length + atrasadas.length;

  const tarefas: Tarefa[] = [
    {
      qtd: doadoras("em_triagem"),
      titulo: "Doadoras em triagem",
      detalhe: "Registrar a triagem ou a sorologia para liberar a doação.",
      href: "/doadoras",
      icone: Users,
    },
    {
      qtd: visitasParaRegistrar,
      titulo: "Visitas para registrar",
      detalhe: atrasadas.length ? `Inclui ${atrasadas.length} atrasada(s) de dias anteriores.` : "Visitas de hoje ainda sem registro.",
      href: "/coleta-domiciliar",
      icone: Home,
    },
    {
      qtd: crus("coletado"),
      titulo: "Frascos para receber",
      detalhe: "Coletados nas casas, aguardando a conferência no banco.",
      href: "/recepcao",
      icone: ClipboardCheck,
    },
    {
      qtd: crus("conforme"),
      titulo: "Frascos para pasteurizar",
      detalhe: "Leite cru conforme, guardado e pronto para o pasteurizador.",
      href: "/processamento",
      icone: FlaskConical,
    },
    {
      qtd: reenvasePendente,
      titulo: "Pasteurizações para reenvasar",
      detalhe: "Leite pasteurizado que ainda precisa ir para frascos novos.",
      href: "/processamento",
      icone: Package,
    },
    {
      qtd: estoque("quarentena", undefined, "total"),
      titulo: "Frascos para analisar",
      detalhe: "Em quarentena: só são liberados depois da análise.",
      href: "/processamento",
      icone: Microscope,
    },
    {
      qtd: receitasAbertas.length,
      titulo: "Bebês sem todo o leite",
      detalhe: "Receitas que ainda precisam de frascos separados.",
      href: "/preparacao",
      icone: PackagePlus,
    },
    {
      qtd: separadosSemFicha,
      titulo: "Frascos para entregar",
      detalhe: "Separados para um bebê, falta gerar a ficha de distribuição.",
      href: "/distribuicao",
      icone: Truck,
    },
    {
      qtd: entreguesSemBaixa,
      titulo: "Confirmar leite dado ao bebê",
      detalhe: "Entregues ao hospital, sem a data em que o bebê recebeu.",
      href: "/distribuicao",
      icone: CheckCheck,
    },
    { qtd: frascosADevolver, titulo: "Frascos vazios com hospitais", detalhe: "Ainda não devolvidos ao banco.", href: "/distribuicao", icone: Undo2 },
  ].filter((t) => t.qtd > 0);

  const carregando = isLoading || visitas.isLoading || prescricoes.isLoading;
  const valor = (v: number | string) => (carregando ? "…" : v);

  return (
    <main className="flex w-full flex-col gap-5 p-4 sm:p-6">
      <PageHeader
        titulo={`${saudacao()}${nome ? `, ${nome}` : ""}!`}
        descricao={`${dataPorExtenso()} · ${zonaHoje ? `hoje é dia de coleta na ${zonaHoje.nome}` : "hoje não há coleta domiciliar"}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador
          titulo="Doadoras ativas"
          valor={valor(doadoras("ativa"))}
          unidade={doadoras("ativa") === 1 ? "doadora" : "doadoras"}
          icone={Users}
          href="/doadoras"
          descricao={doadoras("em_triagem") ? `Mais ${doadoras("em_triagem")} em triagem.` : "Nenhuma em triagem."}
        />
        <Indicador
          titulo="Leite pronto para uso"
          valor={valor(ml(estoque("disponivel")))}
          icone={Droplet}
          tom="sucesso"
          href="/preparacao"
          descricao={`Em ${estoque("disponivel", undefined, "total")} frasco(s) analisados e aprovados.`}
        />
        <Indicador
          titulo="Coletado em 30 dias"
          valor={valor(ml(coletado30))}
          icone={Home}
          href="/coleta-domiciliar"
          descricao={`Em ${realizadas30.length} visita(s) domiciliar(es).`}
        />
        <Indicador
          titulo="Bebês aguardando leite"
          valor={valor(receitasAbertas.length)}
          unidade={receitasAbertas.length === 1 ? "bebê" : "bebês"}
          icone={Baby}
          tom={receitasAbertas.length ? "alerta" : "sucesso"}
          href="/preparacao"
          descricao={receitasAbertas.length ? `Faltam ${ml(necessidadeTotal)} nas receitas.` : "Todas as receitas atendidas."}
        />
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_24rem]">
        <Card titulo="Fila de trabalho" descricao="O que está esperando alguém, na ordem do caminho do leite." tabela>
          {carregando ? (
            <p className="border-t border-border px-5 py-6 text-sm text-muted-foreground">Carregando…</p>
          ) : error ? (
            <p className="border-t border-border px-5 py-6 text-sm text-danger">{error.message}</p>
          ) : tarefas.length === 0 ? (
            <p className="flex items-center gap-2 border-t border-border px-5 py-6 text-sm font-medium text-success">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              Tudo em dia. Nenhuma pendência no momento.
            </p>
          ) : (
            <ul className="divide-y divide-border border-t border-border">
              {tarefas.map((t) => {
                const Icone = t.icone;
                return (
                  <li key={t.titulo}>
                    <Link href={t.href} className="group flex items-center gap-4 px-5 py-3 transition-colors hover:bg-primary/5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning">
                        <Icone className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-foreground">{t.titulo}</span>
                        <span className="block text-xs text-muted-foreground">{t.detalhe}</span>
                      </span>
                      <span className="text-2xl font-bold tabular-nums text-foreground">{t.qtd}</span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card
          titulo={zonaHoje ? "Coleta de hoje" : "Próxima coleta"}
          descricao={zonaColeta ? `${zonaColeta.nome} · ${rotulo(zonaColeta.dia_da_semana).toLowerCase()}, ${formatarData(dataColeta)}` : undefined}
          tabela
          acao={
            <Link href="/coleta-domiciliar" className="text-sm font-semibold text-primary hover:underline">
              Abrir
            </Link>
          }
        >
          {visitasDaColeta.length === 0 ? (
            <p className="border-t border-border px-5 py-6 text-sm text-muted-foreground">
              Nenhuma visita agendada {zonaHoje ? "para hoje" : "para esse dia"}. Agende pela Coleta Domiciliar.
            </p>
          ) : (
            <ul className="divide-y divide-border border-t border-border">
              {visitasDaColeta.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">{v.doadora_nome}</span>
                    <span className="block truncate text-xs text-muted-foreground">{v.endereco_bairro || v.telefone || "—"}</span>
                  </span>
                  <StatusBadge status={v.status} />
                </li>
              ))}
            </ul>
          )}
          {atrasadas.length ? (
            <p className="border-t border-border bg-danger/5 px-5 py-2.5 text-xs font-medium text-danger">
              {atrasadas.length} visita(s) atrasada(s), a mais antiga de {formatarData(atrasadas.map((v) => v.data).sort()[0])}.
            </p>
          ) : null}
        </Card>
      </div>

      <Card titulo="Estoque × necessidade dos bebês" descricao="Leite liberado de cada tipo comparado com o que ainda falta separar nas receitas em aberto.">
        <ul className="grid gap-4 md:grid-cols-3">
          {TIPOS.map((tipo) => {
            const liberado = estoque("disponivel", tipo);
            const emAnalise = estoque("quarentena", tipo);
            const precisa = necessidade(tipo);
            const escala = Math.max(liberado + emAnalise, precisa, 1);
            return (
              <li key={tipo} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">{rotulo(tipo)}</span>
                  {precisa === 0 ? (
                    <StatusBadge status="inativo" texto="Sem receitas" />
                  ) : liberado >= precisa ? (
                    <StatusBadge status="conforme" texto="Estoque cobre" />
                  ) : (
                    <StatusBadge status="descartado" texto={`Faltam ${ml(precisa - liberado)}`} />
                  )}
                </div>
                <div className="relative h-3 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${(liberado / escala) * 100}%` }} />
                  <div
                    className="absolute inset-y-0 bg-primary/30"
                    style={{ left: `${(liberado / escala) * 100}%`, width: `${(emAnalise / escala) * 100}%` }}
                  />
                  {precisa > 0 ? (
                    <div className="absolute inset-y-0 w-0.5 bg-foreground" style={{ left: `calc(${Math.min((precisa / escala) * 100, 100)}% - 2px)` }} />
                  ) : null}
                </div>
                <dl className="grid grid-cols-3 gap-2 text-center">
                  <Valor rotulo="Liberado" valor={ml(liberado)} />
                  <Valor rotulo="Em análise" valor={ml(emAnalise)} />
                  <Valor rotulo="Bebês precisam" valor={ml(precisa)} />
                </dl>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Liberado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary/30" /> Em análise
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-0.5 bg-foreground" /> Necessidade das receitas
          </span>
        </p>
      </Card>
    </main>
  );
}

function Valor({ rotulo: texto, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{texto}</dt>
      <dd className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{valor}</dd>
    </div>
  );
}

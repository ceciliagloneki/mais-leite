"use client";

import { useState } from "react";
import { Printer } from "lucide-react";

import { Botao } from "@/components/Button";
import { Card } from "@/components/Card";
import { Codigo, DataTable, Numero, TextoApoio, TextoDuplo } from "@/components/DataTable";
import { EtiquetaLeiteCru, EtiquetaLeitePasteurizado } from "@/components/Etiquetas";
import { FiltrosEtapas } from "@/components/Filters";
import { Dado, Dados } from "@/components/InfoGrid";
import { PassoLinhaDoTempo, ProgressoEtapas } from "@/components/LinhaDoTempo";
import { ImpressaoModal, Modal } from "@/components/Modal";
import { PageHeader } from "@/components/PageHeader";
import { Busca } from "@/components/SearchInput";
import { StatusBadge } from "@/components/StatusBadge";
import { useDoadora } from "@/hooks/use-doadoras";
import { ETAPAS, passosDoCaminho, useCaminhoDosFrascos, type CaminhoFrasco, type Etapa, type FrascoProcessado } from "@/hooks/use-frascos";
import { contem, formatarData, ml, rotulo, temperatura } from "@/lib/format";
import type { FrascoCru } from "@/types/coleta";

const GRUPOS: { valor: string; texto: string; etapas: Etapa[]; separada?: boolean }[] = [
  { valor: "todos", texto: "Todos os frascos", etapas: [] },
  { valor: "coleta", texto: "Aguardando recepção", etapas: ["aguardando_recepcao"] },
  { valor: "processamento", texto: "Em processamento", etapas: ["aguardando_pasteurizacao", "aguardando_reenvase", "em_analise"] },
  { valor: "estoque", texto: "Em estoque", etapas: ["liberado", "separado"] },
  { valor: "entregues", texto: "Entregues", etapas: ["entregue", "dado_ao_bebe"] },
  { valor: "perdidos", texto: "Descartados", etapas: ["descartado", "reprovado", "bloqueado"], separada: true },
];

const TOM_ETAPA: Record<string, string> = {
  pendente: "text-warning",
  quarentena: "text-warning",
  descartado: "text-danger",
  reprovado: "text-danger",
  bloqueado: "text-danger",
  disponivel: "text-success",
  alocado: "text-info",
  distribuido: "text-success",
  atendida: "text-success",
};

export default function FrascosPage() {
  const { caminhos, carregando, erro } = useCaminhoDosFrascos();
  const [busca, setBusca] = useState("");
  const [grupo, setGrupo] = useState("todos");
  const [abertoId, setAbertoId] = useState<number | null>(null);
  const [etiquetaCru, setEtiquetaCru] = useState<FrascoCru | null>(null);
  const [etiquetaProcessado, setEtiquetaProcessado] = useState<FrascoProcessado | null>(null);

  const daBusca = caminhos.filter(
    (c) =>
      contem(c.cru.id, busca) || contem(c.cru.doadora_nome, busca) || c.processados.some((f) => contem(f.id, busca) || contem(f.alocacao?.nome_do_rn, busca)),
  );
  const noGrupo = (c: CaminhoFrasco, g: string) => g === "todos" || (GRUPOS.find((x) => x.valor === g)?.etapas ?? []).includes(c.etapa);
  const visiveis = daBusca.filter((c) => noGrupo(c, grupo));
  const aberto = caminhos.find((c) => c.cru.id === abertoId) ?? null;

  return (
    <main className="flex w-full flex-col gap-5 p-4 sm:p-6">
      <PageHeader
        titulo="Rastreabilidade"
        descricao="Todos os frascos de leite cru, da coleta na casa da doadora até o bebê. Clique em um frasco para ver o caminho completo."
      />

      <FiltrosEtapas
        ativo={grupo}
        onTrocar={setGrupo}
        etapas={GRUPOS.map((g) => ({
          valor: g.valor,
          texto: g.texto,
          total: daBusca.filter((c) => noGrupo(c, g.valor)).length,
          separada: g.separada,
          tom: g.valor === "perdidos" ? "perigo" : "padrao",
        }))}
      />

      <Card tabela filtros={<Busca valor={busca} onMudar={setBusca} placeholder="Nº do frasco, doadora ou bebê" />}>
        <DataTable
          carregando={carregando}
          erro={erro}
          itens={visiveis}
          vazio="Nenhum frasco encontrado."
          aoClicar={(c) => setAbertoId(c.cru.id)}
          colunas={[
            {
              titulo: "Frasco",
              valor: (c) => (
                <TextoDuplo
                  principal={<Codigo>{c.cru.id}</Codigo>}
                  secundario={
                    c.processados.length
                      ? `Virou ${c.processados.map((f) => `nº ${f.id}`).join(", ")}`
                      : `1ª coleta ${formatarData(c.cru.data_hora_primeira_coleta).slice(0, 10)}`
                  }
                />
              ),
            },
            {
              titulo: "Doadora",
              valor: (c) => (
                <TextoDuplo
                  principal={c.cru.doadora_nome}
                  secundario={c.visita ? `${c.visita.zona_nome} · coleta em ${formatarData(c.visita.data)}` : undefined}
                />
              ),
            },
            { titulo: "Leite", valor: (c) => <TextoDuplo principal={ml(c.cru.volume_ml)} secundario={rotulo(c.cru.classificacao)} /> },
            {
              titulo: "Onde está",
              valor: (c) => (
                <span className="flex flex-col gap-1.5">
                  <ProgressoEtapas compacto passos={passosDoCaminho(c)} />
                  <span className={`text-xs font-semibold ${TOM_ETAPA[ETAPAS[c.etapa].status] ?? "text-foreground"}`}>{ETAPAS[c.etapa].texto}</span>
                </span>
              ),
            },
            {
              titulo: "Destino",
              valor: (c) => {
                const destinos = c.processados.filter((f) => f.alocacao);
                if (!destinos.length) return <TextoApoio>Ainda sem bebê</TextoApoio>;
                return <TextoDuplo principal={destinos.map((f) => f.alocacao?.nome_do_rn).join(", ")} secundario={destinos[0].alocacao?.hospital_nome} />;
              },
            },
          ]}
        />
      </Card>

      {aberto ? (
        <ModalCaminho caminho={aberto} onFechar={() => setAbertoId(null)} onEtiquetaCru={setEtiquetaCru} onEtiquetaProcessado={setEtiquetaProcessado} />
      ) : null}
      {etiquetaCru ? (
        <ImpressaoModal titulo={`Etiqueta do frasco cru nº ${etiquetaCru.id}`} onFechar={() => setEtiquetaCru(null)}>
          <EtiquetaLeiteCru frasco={etiquetaCru} />
        </ImpressaoModal>
      ) : null}
      {etiquetaProcessado ? (
        <ImpressaoModal titulo={`Etiqueta do frasco nº ${etiquetaProcessado.id}`} onFechar={() => setEtiquetaProcessado(null)}>
          <EtiquetaLeitePasteurizado frasco={etiquetaProcessado} />
        </ImpressaoModal>
      ) : null}
    </main>
  );
}

function ModalCaminho({
  caminho: c,
  onFechar,
  onEtiquetaCru,
  onEtiquetaProcessado,
}: {
  caminho: CaminhoFrasco;
  onFechar: () => void;
  onEtiquetaCru: (f: FrascoCru) => void;
  onEtiquetaProcessado: (f: FrascoProcessado) => void;
}) {
  const doadora = useDoadora(c.cru.doadora_id);
  const sorologias = doadora.data?.sorologias ?? [];
  const descartado = c.cru.status === "descartado";
  const destinos = c.processados.filter((f) => f.alocacao);

  return (
    <Modal
      titulo={`Frasco de leite cru nº ${c.cru.id}`}
      descricao={`${c.cru.doadora_nome} · ${rotulo(c.cru.classificacao)} · ${ml(c.cru.volume_ml)}`}
      tamanho="lg"
      onFechar={onFechar}
      rodape={
        <>
          <Botao pequeno variante="secundario" icone={Printer} onClick={() => onEtiquetaCru(c.cru)}>
            Etiqueta do Frasco Cru
          </Botao>
          <Botao pequeno onClick={onFechar}>
            Fechar
          </Botao>
        </>
      }
    >
      <div className="flex flex-col gap-5 px-5 py-5">
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/30 px-4 pb-4 pt-5">
          <ProgressoEtapas passos={passosDoCaminho(c)} />
          <p className="text-center text-sm text-muted-foreground">
            Agora: <strong className={TOM_ETAPA[ETAPAS[c.etapa].status] ?? "text-foreground"}>{ETAPAS[c.etapa].texto}</strong>
          </p>
        </div>

        <div className="flex flex-col">
          <PassoLinhaDoTempo numero={1} titulo="Doadora e sorologia">
            <Dados>
              <Dado rotulo="Doadora" valor={`${c.cru.doadora_nome} (nº ${c.cru.doadora_id})`} />
              <Dado rotulo="Nascimento" valor={formatarData(c.cru.doadora_data_nasc)} />
              <Dado rotulo="Data do parto" valor={formatarData(doadora.data?.data_parto)} />
              <Dado
                rotulo="Sorologia"
                valor={
                  sorologias.length ? (
                    <span className="flex flex-wrap gap-1.5">
                      {sorologias.map((s) => (
                        <StatusBadge key={s.numero_amostra} status={s.resultado} texto={`${s.numero_amostra}ª ${rotulo(s.resultado).toLowerCase()}`} />
                      ))}
                    </span>
                  ) : (
                    "Sem amostras"
                  )
                }
              />
            </Dados>
          </PassoLinhaDoTempo>

          <PassoLinhaDoTempo numero={2} titulo="Coleta na casa da doadora">
            <Dados>
              <Dado rotulo="Visita" valor={c.visita ? `${formatarData(c.visita.data)} · ${c.visita.zona_nome}` : "—"} />
              <Dado rotulo="1ª coleta" valor={formatarData(c.cru.data_hora_primeira_coleta)} />
              <Dado rotulo="Volume" valor={ml(c.cru.volume_ml)} />
              <Dado rotulo="Tipo de leite" valor={rotulo(c.cru.classificacao)} />
              <Dado rotulo="Extração" valor={rotulo(c.cru.forma_extracao)} />
              <Dado rotulo="Pré-estocagem" valor={rotulo(c.cru.cond_prestocagem)} />
              <Dado rotulo="Estado" valor={rotulo(c.cru.estado)} />
              <Dado rotulo="Responsável" valor={c.cru.responsavel} />
            </Dados>
          </PassoLinhaDoTempo>

          <PassoLinhaDoTempo numero={3} titulo="Recepção no banco de leite" pendente={!c.recepcao} ultima={descartado}>
            {c.recepcao ? (
              <Dados>
                <Dado rotulo="Recepção" valor={`Nº ${c.recepcao.id} · ${formatarData(c.recepcao.data)}`} />
                <Dado
                  rotulo="Transporte"
                  valor={`${c.recepcao.hora_saida.slice(0, 5)} → ${c.recepcao.hora_chegada.slice(0, 5)} · ${temperatura(c.recepcao.temperatura_caixa)}`}
                />
                <Dado rotulo="Resultado" valor={<StatusBadge status={Number(c.recepcao.conforme) ? "conforme" : "descartado"} />} />
                <Dado rotulo="Motivo do descarte" valor={c.recepcao.motivo_descarte || "—"} />
              </Dados>
            ) : (
              <Pendente texto="O frasco ainda não chegou ao banco de leite." />
            )}
          </PassoLinhaDoTempo>

          {descartado ? null : (
            <>
              <PassoLinhaDoTempo numero={4} titulo="Pasteurização" pendente={!c.pasteurizacao}>
                {c.pasteurizacao ? (
                  <Dados>
                    <Dado rotulo="Pasteurização" valor={`Nº ${c.pasteurizacao.id}`} />
                    <Dado rotulo="Data" valor={formatarData(c.pasteurizacao.data_pasteurizacao)} />
                    <Dado rotulo="Responsável" valor={c.pasteurizacao.funcionario_nome} />
                  </Dados>
                ) : (
                  <Pendente texto="Conforme e guardado, aguardando entrar no pasteurizador." />
                )}
              </PassoLinhaDoTempo>

              <PassoLinhaDoTempo numero={5} titulo="Reenvase e análise" pendente={c.processados.length === 0}>
                {c.processados.length ? (
                  <div className="overflow-hidden rounded-lg border border-border">
                    <DataTable
                      itens={c.processados}
                      porPagina={5}
                      colunas={[
                        { titulo: "Frasco", valor: (f) => <Codigo>{f.id}</Codigo> },
                        { titulo: "Volume", valor: (f) => <Numero>{ml(f.volume)}</Numero>, direita: true },
                        {
                          titulo: "Análise",
                          valor: (f) =>
                            f.data_analise ? (
                              <TextoDuplo
                                principal={Number(f.aprovado) ? "Aprovado" : "Reprovado"}
                                secundario={`Dornic ${f.dornic} °D · BGBL ${rotulo(f.bgbl)}`}
                              />
                            ) : (
                              <TextoApoio>Em análise</TextoApoio>
                            ),
                        },
                        { titulo: "Situação", valor: (f) => <StatusBadge status={f.status} /> },
                        {
                          titulo: "",
                          direita: true,
                          valor: (f) => (
                            <Botao variante="secundario" pequeno icone={Printer} onClick={() => onEtiquetaProcessado(f)}>
                              Etiqueta
                            </Botao>
                          ),
                        },
                      ]}
                    />
                  </div>
                ) : (
                  <Pendente texto={c.pasteurizacao ? "Pasteurizado, aguardando o reenvase em frascos novos." : "Acontece depois da pasteurização."} />
                )}
              </PassoLinhaDoTempo>

              <PassoLinhaDoTempo numero={6} titulo="Destino" pendente={destinos.length === 0} ultima>
                {destinos.length ? (
                  <div className="overflow-hidden rounded-lg border border-border">
                    <DataTable
                      itens={destinos}
                      porPagina={5}
                      colunas={[
                        { titulo: "Frasco", valor: (f) => <Codigo>{f.id}</Codigo> },
                        { titulo: "Bebê (RN)", valor: (f) => <TextoDuplo principal={f.alocacao?.nome_do_rn} secundario={f.alocacao?.hospital_nome} /> },
                        {
                          titulo: "Entrega",
                          valor: (f) =>
                            f.distribuicao ? (
                              <TextoDuplo principal={formatarData(f.distribuicao.data)} secundario={f.distribuicao.setor} />
                            ) : (
                              <TextoApoio>Separado, aguardando entrega</TextoApoio>
                            ),
                        },
                        {
                          titulo: "Dado ao bebê",
                          valor: (f) => <TextoApoio>{f.alocacao?.data_administracao ? formatarData(f.alocacao.data_administracao) : ""}</TextoApoio>,
                        },
                      ]}
                    />
                  </div>
                ) : (
                  <Pendente texto="Ainda não foi separado para nenhum bebê." />
                )}
              </PassoLinhaDoTempo>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

function Pendente({ texto }: { texto: string }) {
  return <p className="rounded-lg border border-dashed border-input px-4 py-3 text-sm text-muted-foreground">{texto}</p>;
}

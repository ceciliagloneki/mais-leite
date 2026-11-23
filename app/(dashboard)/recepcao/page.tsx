"use client";

import { useState } from "react";
import { ClipboardCheck, Milk, Plus, Printer } from "lucide-react";

import { Aviso } from "@/components/Alert";
import { Botao } from "@/components/Button";
import { Card } from "@/components/Card";
import { Codigo, DataTable, Numero, TextoApoio, TextoDuplo } from "@/components/DataTable";
import { EtiquetaLeiteCru } from "@/components/Etiquetas";
import { Campo, Grupo, ListaMarcar, Selecao, SimNao } from "@/components/Field";
import { Filtros } from "@/components/Filters";
import { FormModal } from "@/components/FormModal";
import { ImpressaoModal } from "@/components/Modal";
import { PageHeader } from "@/components/PageHeader";
import { Busca } from "@/components/SearchInput";
import { StatusBadge } from "@/components/StatusBadge";
import { Abas } from "@/components/Tabs";
import { useCriarRecepcao, useFrascosCrus, useRecepcoes } from "@/hooks/use-coletas";
import { useZonas } from "@/hooks/use-doadoras";
import { contem, formatarData, hoje, ml, rotulo, temperatura } from "@/lib/format";
import { diaDeHoje } from "@/lib/regras";
import type { FrascoCru } from "@/types/coleta";

type AbaRecepcao = "recepcoes" | "frascos";

export default function RecepcaoPage() {
  const zonas = useZonas();
  const frascos = useFrascosCrus();
  const recepcoes = useRecepcoes();
  const criar = useCriarRecepcao();
  const [aba, setAba] = useState<AbaRecepcao>("recepcoes");
  const [formAberto, setFormAberto] = useState(false);
  const [etiqueta, setEtiqueta] = useState<FrascoCru | null>(null);
  const [busca, setBusca] = useState("");

  const listaFrascos = frascos.data ?? [];
  const coletados = listaFrascos.filter((f) => f.status === "coletado");
  const [zonaId, setZonaId] = useState("");
  const zonaDoDia = (zonas.data ?? []).find((z) => z.dia_da_semana === diaDeHoje());
  const zonaComFrascos = (zonas.data ?? []).find((z) => coletados.some((f) => f.zona_id === z.id));
  const zonaPadrao = zonaDoDia && coletados.some((f) => f.zona_id === zonaDoDia.id) ? zonaDoDia : (zonaComFrascos ?? zonaDoDia);
  const zonaAtual = zonaId || (zonaPadrao ? String(zonaPadrao.id) : "");
  const visiveis = (recepcoes.data ?? []).filter((r) => contem(r.zona_nome, busca) || contem(r.municipios, busca) || contem(r.id, busca));

  return (
    <main className="flex w-full flex-col gap-5 p-4 sm:p-6">
      <PageHeader
        titulo="Recepção no BLH"
        descricao="Quando a caixa térmica chega, confira os frascos e diga se estão conformes."
        acao={
          <Botao icone={Plus} onClick={() => setFormAberto(true)}>
            Nova Recepção
          </Botao>
        }
      />

      {coletados.length > 0 ? (
        <Aviso
          tom="alerta"
          titulo={`${coletados.length} frasco${coletados.length > 1 ? "s" : ""} aguardando recepção`}
          acao={
            <Botao pequeno onClick={() => setFormAberto(true)}>
              Receber Agora
            </Botao>
          }
        >
          Frascos coletados nas casas que ainda não foram conferidos no banco de leite.
        </Aviso>
      ) : null}

      <Abas<AbaRecepcao>
        ativa={aba}
        onTrocar={setAba}
        abas={[
          { id: "recepcoes", titulo: "Recepções", icone: ClipboardCheck },
          { id: "frascos", titulo: "Frascos de Leite Cru", icone: Milk, contador: coletados.length || undefined },
        ]}
      />

      {aba === "recepcoes" ? (
        <Card tabela filtros={<Busca valor={busca} onMudar={setBusca} placeholder="Buscar por região, município ou número" />}>
          <DataTable
            carregando={recepcoes.isLoading}
            erro={recepcoes.error}
            itens={visiveis}
            vazio="Nenhuma recepção registrada."
            colunas={[
              { titulo: "Nº", valor: (r) => <Codigo>{r.id}</Codigo> },
              { titulo: "Data", valor: (r) => formatarData(r.data) },
              {
                titulo: "Região",
                valor: (r) => <TextoDuplo principal={r.zona_nome} secundario={r.municipios} />,
              },
              { titulo: "Saída → chegada", valor: (r) => `${r.hora_saida.slice(0, 5)} → ${r.hora_chegada.slice(0, 5)}` },
              { titulo: "Temp.", valor: (r) => <Numero>{temperatura(r.temperatura_caixa)}</Numero>, direita: true },
              { titulo: "Frascos", valor: (r) => <Numero>{r.quant_frascos}</Numero>, direita: true },
              { titulo: "Volume", valor: (r) => <Numero>{ml(r.volume_total)}</Numero>, direita: true },
              {
                titulo: "Resultado",
                valor: (r) => (Number(r.conforme) ? <StatusBadge status="conforme" /> : <StatusBadge status="descartado" />),
              },
              { titulo: "Motivo do descarte", valor: (r) => <TextoApoio>{Number(r.conforme) ? "" : r.motivo_descarte}</TextoApoio> },
            ]}
          />
        </Card>
      ) : (
        <TodosFrascosCrus frascos={listaFrascos} carregando={frascos.isLoading} erro={frascos.error} onEtiqueta={setEtiqueta} />
      )}

      {formAberto ? (
        <FormModal
          titulo="Nova Recepção"
          descricao="A quantidade e o volume total são calculados a partir dos frascos marcados."
          botao="Salvar Recepção"
          mensagemSucesso="Recepção registrada."
          tamanho="lg"
          onSubmit={criar.mutateAsync}
          onFechar={() => {
            setFormAberto(false);
            setZonaId("");
          }}
        >
          <Grupo>Transporte</Grupo>
          <Campo label="Data" name="data" type="date" required defaultValue={hoje()} max={hoje()} />
          <div
            onChange={(e) => {
              const alvo = e.target as HTMLSelectElement;
              if (alvo.name === "zona_id") setZonaId(alvo.value);
            }}
          >
            <Selecao
              label="Zona da caixa térmica"
              name="zona_id"
              required
              defaultValue={zonaAtual}
              ajuda="Cada caixa traz os frascos de uma zona só."
              opcoes={(zonas.data ?? []).map((z) => {
                const n = coletados.filter((f) => f.zona_id === z.id).length;
                return { valor: z.id, texto: `${z.nome} (${rotulo(z.dia_da_semana).toLowerCase()})${n ? ` · ${n} frasco${n > 1 ? "s" : ""}` : ""}` };
              })}
            />
          </div>
          <Campo label="Municípios" name="municipios" required defaultValue="Marília" />
          <Campo label="Temperatura da caixa (°C)" name="temperatura_caixa" type="number" required placeholder="Ex.: -10" />
          <Campo label="Horário de saída" name="hora_saida" type="time" required />
          <Campo label="Horário de chegada" name="hora_chegada" type="time" required />

          <Grupo descricao="Marque todos os frascos que chegaram nesta caixa.">Frascos recebidos</Grupo>
          <ListaMarcar
            label="Frascos"
            name="frascos_ids"
            key={zonaAtual}
            vazio="Nenhum frasco desta zona aguardando recepção. Os frascos aparecem aqui depois de registrados na Coleta Domiciliar."
            itens={coletados
              .filter((f) => String(f.zona_id) === String(zonaAtual))
              .map((f) => ({
                valor: f.id,
                texto: `Nº ${f.id} · ${f.doadora_nome} · ${ml(f.volume_ml)} · ${rotulo(f.classificacao)} · 1ª coleta ${formatarData(f.data_hora_primeira_coleta)}`,
              }))}
          />

          <Grupo>Resultado da inspeção</Grupo>
          <SimNao
            label="Os frascos estão conformes?"
            name="conforme"
            required
            textoSim="Sim, conformes — guardar para pasteurizar"
            textoNao="Não conformes — descartar"
          />
          <Campo label="Motivo do descarte" name="motivo_descarte" largo ajuda="Obrigatório se os frascos não estiverem conformes." />
        </FormModal>
      ) : null}

      {etiqueta ? (
        <ImpressaoModal titulo={`Etiqueta do frasco nº ${etiqueta.id}`} onFechar={() => setEtiqueta(null)}>
          <EtiquetaLeiteCru frasco={etiqueta} />
        </ImpressaoModal>
      ) : null}
    </main>
  );
}

function TodosFrascosCrus({
  frascos,
  carregando,
  erro,
  onEtiqueta,
}: {
  frascos: FrascoCru[];
  carregando: boolean;
  erro: Error | null;
  onEtiqueta: (frasco: FrascoCru) => void;
}) {
  const [busca, setBusca] = useState("");
  const [situacao, setSituacao] = useState("todos");
  const total = (status: string) => frascos.filter((f) => f.status === status).length;
  const daRecepcao = frascos.filter((f) => f.status !== "pasteurizado");
  const visiveis = daRecepcao.filter((f) => (situacao === "todos" || f.status === situacao) && (contem(f.doadora_nome, busca) || contem(f.id, busca)));

  return (
    <Card
      tabela
      filtros={
        <>
          <Busca valor={busca} onMudar={setBusca} placeholder="Buscar por doadora ou nº do frasco" />
          <div className="lg:ml-auto">
            <Filtros
              ativo={situacao}
              onTrocar={setSituacao}
              opcoes={[
                { valor: "todos", texto: "Todos", total: daRecepcao.length },
                { valor: "coletado", texto: "Aguardando recepção", total: total("coletado") },
                { valor: "conforme", texto: "Conformes", total: total("conforme") },
                { valor: "descartado", texto: "Descartados", total: total("descartado") },
              ]}
            />
          </div>
        </>
      }
    >
      <DataTable
        carregando={carregando}
        erro={erro}
        itens={visiveis}
        vazio="Nenhum frasco encontrado. Frascos que já foram pasteurizados ficam em Rastreabilidade."
        colunas={[
          { titulo: "Nº", valor: (f) => <Codigo>{f.id}</Codigo> },
          { titulo: "Doadora", valor: (f) => <TextoDuplo principal={f.doadora_nome} /> },
          { titulo: "1ª coleta", valor: (f) => formatarData(f.data_hora_primeira_coleta) },
          { titulo: "Tipo", valor: (f) => rotulo(f.classificacao) },
          { titulo: "Volume", valor: (f) => <Numero>{ml(f.volume_ml)}</Numero>, direita: true },
          { titulo: "Situação", valor: (f) => <StatusBadge status={f.status} texto={f.status === "coletado" ? "Aguardando recepção" : undefined} /> },
          {
            titulo: "",
            direita: true,
            valor: (f) => (
              <Botao variante="secundario" pequeno icone={Printer} onClick={() => onEtiqueta(f)}>
                Etiqueta
              </Botao>
            ),
          },
        ]}
      />
    </Card>
  );
}

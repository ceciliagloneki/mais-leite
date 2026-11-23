"use client";

import { useState } from "react";
import { CheckCheck, FileText, Plus, Undo2 } from "lucide-react";

import { Botao } from "@/components/Button";
import { Card } from "@/components/Card";
import { Codigo, DataTable, Numero, TextoDuplo } from "@/components/DataTable";
import { Campo, Grupo, Selecao } from "@/components/Field";
import { FichaDistribuicaoImpressa } from "@/components/Etiquetas";
import { FormModal } from "@/components/FormModal";
import { ImpressaoModal } from "@/components/Modal";
import { PageHeader } from "@/components/PageHeader";
import { Abas } from "@/components/Tabs";
import {
  useAlocacoes,
  useCriarDevolucao,
  useCriarDistribuicao,
  useDevolucoes,
  useDistribuicoes,
  useFicha,
  useRegistrarAdministracao,
} from "@/hooks/use-distribuicao";
import { useDemandas, useHospitais } from "@/hooks/use-hospitais";
import { getAuthenticatedEmployee } from "@/lib/auth";
import { formatarData, hoje, horaAtual, ml, opcoes, rotulo, temperatura } from "@/lib/format";
import type { DadosFormulario } from "@/lib/form";
import { somarDias } from "@/lib/regras";
import type { Distribuicao } from "@/types/distribuicao";
import type { Hospital } from "@/types/hospital";

type AbaDistribuicao = "fichas" | "baixa" | "devolucao";
type Formulario = { tipo: "ficha" } | { tipo: "baixa"; alocacaoId?: number } | { tipo: "devolucao" } | null;

export default function DistribuicaoPage() {
  const demandas = useDemandas();
  const hospitais = useHospitais();
  const distribuicoes = useDistribuicoes();
  const alocacoes = useAlocacoes();
  const devolucoes = useDevolucoes();
  const criarFicha = useCriarDistribuicao();
  const administrar = useRegistrarAdministracao();
  const devolver = useCriarDevolucao();
  const [aba, setAba] = useState<AbaDistribuicao>("fichas");
  const [formulario, setFormulario] = useState<Formulario>(null);
  const [fichaId, setFichaId] = useState<number | null>(null);
  const ficha = useFicha(fichaId);

  const pendentes = (demandas.data ?? []).filter((d) => d.status === "pendente");
  const semBaixa = (alocacoes.data ?? []).filter((a) => a.distribuicao_id !== null && a.data_administracao === null);
  const fechar = () => setFormulario(null);

  const botaoNovo = {
    fichas: (
      <Botao icone={Plus} onClick={() => setFormulario({ tipo: "ficha" })}>
        Nova Ficha
      </Botao>
    ),
    baixa: null,
    devolucao: (
      <Botao icone={Plus} onClick={() => setFormulario({ tipo: "devolucao" })}>
        Nova Devolução
      </Botao>
    ),
  }[aba];

  return (
    <main className="flex w-full flex-col gap-5 p-4 sm:p-6">
      <PageHeader
        titulo="Distribuição"
        descricao="Gere a ficha que acompanha a caixa térmica até o hospital. Depois registre quando o leite foi dado ao bebê e a devolução dos frascos vazios."
        acao={botaoNovo}
      />

      {fichaId !== null && ficha.data ? (
        <ImpressaoModal titulo={`Ficha de distribuição nº ${ficha.data.id}`} tamanho="lg" onFechar={() => setFichaId(null)}>
          <FichaDistribuicaoImpressa ficha={ficha.data} />
        </ImpressaoModal>
      ) : null}

      {formulario?.tipo === "ficha" ? (
        <FormModal
          titulo="Nova Ficha de Distribuição"
          descricao="A ficha leva todos os frascos já separados para o pedido escolhido."
          botao="Gerar Ficha"
          mensagemSucesso="Ficha gerada. Use “Ver e Imprimir” na lista."
          onSubmit={criarFicha.mutateAsync}
          onFechar={fechar}
        >
          <Selecao
            label="Pedido"
            name="demanda_id"
            required
            largo
            opcoes={pendentes.map((d) => ({ valor: d.id, texto: `Pedido nº ${d.id} · ${d.hospital_nome} · ${formatarData(d.data_demanda)}` }))}
          />
          <Campo label="Data" name="data" type="date" required defaultValue={hoje()} />
          <Campo label="Horário" name="horario" type="time" required defaultValue={horaAtual()} />
          <Campo label="Setor" name="setor" required placeholder="Ex.: UTI Neonatal" />
          <Selecao label="Caixa térmica" name="volume_caixa" required opcoes={[200, 250, 300, 350].map((v) => ({ valor: v, texto: `${v} mL` }))} />
          <Campo label="Temperatura (°C)" name="temperatura" type="number" required />
          <Grupo>Assinaturas</Grupo>
          <Campo label="Quem entrega" name="assinatura_entrega" required defaultValue={getAuthenticatedEmployee()?.nome} />
          <Campo label="Quem recebe" name="assinatura_recebimento" required />
        </FormModal>
      ) : null}

      {formulario?.tipo === "baixa" ? (
        <FormModal
          titulo="Registrar Leite Dado ao Bebê"
          botao="Salvar"
          mensagemSucesso="Administração registrada."
          onSubmit={administrar.mutateAsync}
          onFechar={fechar}
        >
          <Selecao
            label="Frasco entregue"
            name="alocacao_id"
            required
            largo
            defaultValue={formulario.alocacaoId}
            opcoes={semBaixa.map((a) => ({ valor: a.id, texto: `Frasco nº ${a.frasco_pasteurizado_id} · ${a.nome_do_rn} · ${a.hospital_nome}` }))}
          />
          <Campo label="Data em que foi dado ao bebê" name="data_administracao" type="date" required defaultValue={hoje()} />
        </FormModal>
      ) : null}

      {formulario?.tipo === "devolucao" ? (
        <FormDevolucao hospitais={hospitais.data ?? []} distribuicoes={distribuicoes.data ?? []} onSubmit={devolver.mutateAsync} onFechar={fechar} />
      ) : null}

      <Abas<AbaDistribuicao>
        ativa={aba}
        onTrocar={(nova) => {
          setAba(nova);
          setFormulario(null);
        }}
        abas={[
          { id: "fichas", titulo: "Fichas de distribuição", icone: FileText },
          { id: "baixa", titulo: "Dado ao bebê", icone: CheckCheck, contador: semBaixa.length },
          { id: "devolucao", titulo: "Devolução de frascos", icone: Undo2 },
        ]}
      />

      {aba === "fichas" ? (
        <Card tabela>
          <DataTable
            carregando={distribuicoes.isLoading}
            erro={distribuicoes.error}
            itens={distribuicoes.data}
            vazio="Nenhuma ficha de distribuição gerada."
            colunas={[
              { titulo: "Nº", valor: (d) => <Codigo>{d.id}</Codigo> },
              { titulo: "Data", valor: (d) => `${formatarData(d.data)} ${d.horario.slice(0, 5)}` },
              {
                titulo: "Hospital",
                valor: (d) => (
                  <div>
                    <p className="font-medium">{d.hospital_nome}</p>
                    <p className="text-sm text-muted-foreground">{d.setor}</p>
                  </div>
                ),
              },
              { titulo: "Frascos", valor: (d) => <Numero>{d.quant_frascos}</Numero>, direita: true },
              { titulo: "Caixa", valor: (d) => <Numero>{`${ml(d.volume_caixa)} · ${temperatura(d.temperatura)}`}</Numero> },
              {
                titulo: "",
                direita: true,
                valor: (d) => (
                  <Botao variante="secundario" pequeno icone={FileText} onClick={() => setFichaId(d.id)}>
                    Ver e Imprimir
                  </Botao>
                ),
              },
            ]}
          />
        </Card>
      ) : null}

      {aba === "baixa" ? (
        <Card titulo="Frascos entregues aguardando confirmação" descricao="Confirme a data em que cada frasco foi dado ao bebê." tabela>
          <DataTable
            carregando={alocacoes.isLoading}
            erro={alocacoes.error}
            itens={semBaixa}
            vazio="Nenhum frasco aguardando confirmação."
            colunas={[
              { titulo: "Nº frasco", valor: (a) => <Codigo>{a.frasco_pasteurizado_id}</Codigo> },
              { titulo: "Bebê (RN)", valor: (a) => <TextoDuplo principal={a.nome_do_rn} /> },
              { titulo: "Hospital", valor: (a) => a.hospital_nome },
              { titulo: "Tipo", valor: (a) => rotulo(a.classificacao) },
              { titulo: "Volume", valor: (a) => <Numero>{ml(a.volume)}</Numero>, direita: true },
              {
                titulo: "",
                direita: true,
                valor: (a) => (
                  <Botao pequeno icone={CheckCheck} onClick={() => setFormulario({ tipo: "baixa", alocacaoId: a.id })}>
                    Confirmar
                  </Botao>
                ),
              },
            ]}
          />
        </Card>
      ) : null}

      {aba === "devolucao" ? (
        <Card tabela>
          <DataTable
            carregando={devolucoes.isLoading}
            erro={devolucoes.error}
            itens={devolucoes.data}
            vazio="Nenhuma devolução registrada."
            colunas={[
              { titulo: "Data", valor: (d) => formatarData(d.data) },
              { titulo: "Hospital", valor: (d) => <TextoDuplo principal={d.hospital_nome} /> },
              { titulo: "Tipo de frasco", valor: (d) => rotulo(d.tipo_frasco) },
              { titulo: "Enviados", valor: (d) => <Numero>{d.qtd_enviada}</Numero>, direita: true },
              { titulo: "Voltaram", valor: (d) => <Numero>{d.qtd_recebida}</Numero>, direita: true },
              {
                titulo: "Faltam",
                direita: true,
                valor: (d) => (Number(d.faltam) > 0 ? <strong className="text-danger">{d.faltam}</strong> : <span className="text-success">0</span>),
              },
            ]}
          />
        </Card>
      ) : null}
    </main>
  );
}

function FormDevolucao({
  hospitais,
  distribuicoes,
  onSubmit,
  onFechar,
}: {
  hospitais: Hospital[];
  distribuicoes: Distribuicao[];
  onSubmit: (dados: DadosFormulario) => Promise<unknown>;
  onFechar: () => void;
}) {
  const [hospitalId, setHospitalId] = useState("");
  const [data, setData] = useState(hoje());

  const hospital = hospitais.find((h) => String(h.id) === hospitalId);
  const inicio = somarDias(data, -7);
  const fichas = distribuicoes.filter((d) => hospital && d.hospital_nome === hospital.nome && d.data.slice(0, 10) >= inicio && d.data.slice(0, 10) < data);
  const enviados = fichas.reduce((s, d) => s + Number(d.quant_frascos), 0);

  return (
    <FormModal
      titulo="Nova Devolução de Frascos Vazios"
      descricao="Os frascos enviados vêm das fichas de distribuição da semana anterior. Informe quantos voltaram."
      botao="Salvar Devolução"
      mensagemSucesso="Devolução registrada."
      onSubmit={onSubmit}
      onFechar={onFechar}
    >
      <div
        className="contents"
        onChange={(e) => {
          const alvo = e.target as HTMLInputElement;
          if (alvo.name === "hospital_id") setHospitalId(alvo.value);
        }}
      >
        <Selecao label="Hospital" name="hospital_id" required opcoes={hospitais.map((h) => ({ valor: h.id, texto: h.nome }))} />
      </div>
      <Campo label="Data" name="data" type="date" required defaultValue={data} max={hoje()} onInput={(e) => setData(e.currentTarget.value || hoje())} />
      <Selecao label="Tipo de frasco" name="tipo_frasco" required opcoes={opcoes(["tampa_plastica_500ml", "graduado_200ml"])} />
      <div className="hidden sm:block" />
      <Campo
        key={`${hospitalId}-${data}-${enviados}`}
        label="Quantos foram enviados"
        name="qtd_enviada"
        type="number"
        min={0}
        required
        defaultValue={hospital ? enviados : undefined}
        ajuda={
          hospital
            ? `${enviados} frasco${enviados === 1 ? "" : "s"} em ${fichas.length} ficha${fichas.length === 1 ? "" : "s"} de ${formatarData(inicio)} a ${formatarData(somarDias(data, -1))}. Ajuste se separar por tipo de frasco.`
            : "Escolha o hospital: o total vem das fichas de distribuição."
        }
      />
      <Campo label="Quantos voltaram" name="qtd_recebida" type="number" min={0} required />
    </FormModal>
  );
}

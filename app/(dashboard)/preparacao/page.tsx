"use client";

import Link from "next/link";
import { useState } from "react";
import { PackagePlus, Plus } from "lucide-react";

import { Aviso } from "@/components/Alert";
import { Botao, classeBotao } from "@/components/Button";
import { Card } from "@/components/Card";
import { Codigo, DataTable, Numero, TextoDuplo } from "@/components/DataTable";
import { Selecao } from "@/components/Field";
import { FormModal } from "@/components/FormModal";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Abas } from "@/components/Tabs";
import { useAlocacoes, useAlocarFrasco } from "@/hooks/use-distribuicao";
import { usePrescricoes } from "@/hooks/use-hospitais";
import { useFrascosPasteurizados } from "@/hooks/use-processamento";
import { ml, rotulo } from "@/lib/format";
import type { Prescricao } from "@/types/hospital";

type AbaPreparacao = "receitas" | "separados";

export default function PreparacaoPage() {
  const prescricoes = usePrescricoes();
  const disponiveis = useFrascosPasteurizados("disponivel");
  const alocacoes = useAlocacoes();
  const alocar = useAlocarFrasco();
  const [aba, setAba] = useState<AbaPreparacao>("receitas");
  const [receita, setReceita] = useState<Prescricao | null | undefined>(undefined);

  const pendentes = (prescricoes.data ?? []).filter((p) => p.demanda_status === "pendente");
  const separados = (alocacoes.data ?? []).filter((a) => a.distribuicao_id === null);
  const falta = (p: Prescricao) => Math.max(Number(p.volume_prescrito) - Number(p.volume_alocado), 0);
  const frascos = (disponiveis.data ?? []).filter((f) => !receita || f.classificacao === receita.tipo_leite);

  return (
    <main className="flex w-full flex-col gap-5 p-4 sm:p-6">
      <PageHeader
        titulo="Preparação para Entrega"
        descricao="Escolha, no estoque, os frascos de leite aprovado que vão para cada bebê. O frasco precisa ser do mesmo tipo de leite da receita."
        acao={
          <Botao icone={Plus} onClick={() => setReceita(null)}>
            Nova Separação
          </Botao>
        }
      />

      {receita !== undefined ? (
        <FormModal
          titulo="Nova Separação"
          descricao={
            receita
              ? `${receita.nome_do_rn} · ${rotulo(receita.tipo_leite)} · faltam ${ml(falta(receita))}`
              : "Escolha a receita: a lista mostra só os frascos aprovados do mesmo tipo de leite."
          }
          botao="Separar Frasco"
          mensagemSucesso="Frasco separado para o bebê."
          onSubmit={alocar.mutateAsync}
          onFechar={() => setReceita(undefined)}
        >
          <Selecao
            label="Receita (bebê)"
            name="prescricao_id"
            required
            largo
            defaultValue={receita?.id}
            opcoes={pendentes.map((p) => ({
              valor: p.id,
              texto: `${p.nome_do_rn} · ${rotulo(p.tipo_leite)} · faltam ${ml(falta(p))} · ${p.hospital_nome}`,
            }))}
          />
          <Selecao
            label="Frasco de leite aprovado"
            name="frasco_pasteurizado_id"
            required
            largo
            ajuda={receita ? `Mostrando só frascos de ${rotulo(receita.tipo_leite)}.` : undefined}
            opcoes={frascos.map((f) => ({ valor: f.id, texto: `Frasco nº ${f.id} · ${rotulo(f.classificacao)} · ${ml(f.volume)}` }))}
          />
        </FormModal>
      ) : null}

      {!disponiveis.isLoading && (disponiveis.data ?? []).length === 0 ? (
        <Aviso tom="alerta" titulo="Não há frascos aprovados no estoque.">
          Os frascos aparecem aqui depois da análise na tela de Processamento.
        </Aviso>
      ) : null}

      <Abas<AbaPreparacao>
        ativa={aba}
        onTrocar={setAba}
        abas={[
          { id: "receitas", titulo: "Receitas em Aberto", contador: pendentes.filter((p) => falta(p) > 0).length || undefined },
          { id: "separados", titulo: "Separados para Entrega", contador: separados.length || undefined },
        ]}
      />

      {aba === "receitas" ? (
        <Card titulo="Receitas aguardando leite" descricao="Bebês dos pedidos em aberto. Separe frascos até completar o volume prescrito." tabela>
          <DataTable
            carregando={prescricoes.isLoading}
            erro={prescricoes.error}
            itens={pendentes}
            vazio="Nenhuma receita em aberto. As receitas são cadastradas em Hospitais e pedidos."
            colunas={[
              { titulo: "Bebê (RN)", valor: (p) => <TextoDuplo principal={p.nome_do_rn} /> },
              { titulo: "Hospital", valor: (p) => p.hospital_nome },
              { titulo: "Tipo de leite", valor: (p) => rotulo(p.tipo_leite) },
              { titulo: "Prescrito", valor: (p) => <Numero>{ml(p.volume_prescrito)}</Numero>, direita: true },
              { titulo: "Separado", valor: (p) => <Numero>{ml(p.volume_alocado)}</Numero>, direita: true },
              {
                titulo: "Falta",
                direita: true,
                valor: (p) =>
                  falta(p) > 0 ? <strong className="tabular-nums text-warning">{ml(falta(p))}</strong> : <StatusBadge status="conforme" texto="Completo" />,
              },
              {
                titulo: "",
                direita: true,
                valor: (p) =>
                  falta(p) > 0 ? (
                    <Botao variante="secundario" pequeno icone={PackagePlus} onClick={() => setReceita(p)}>
                      Separar Frasco
                    </Botao>
                  ) : null,
              },
            ]}
          />
        </Card>
      ) : (
        <Card
          titulo="Frascos separados aguardando entrega"
          descricao="Já reservados para um bebê. Na Distribuição, eles entram na ficha que acompanha a caixa térmica até o hospital."
          tabela
          acao={
            separados.length > 0 ? (
              <Link href="/distribuicao" className={classeBotao("secundario", true)}>
                Ir para Distribuição
              </Link>
            ) : null
          }
        >
          <DataTable
            carregando={alocacoes.isLoading}
            erro={alocacoes.error}
            itens={separados}
            vazio="Nenhum frasco separado no momento."
            colunas={[
              { titulo: "Nº frasco", valor: (a) => <Codigo>{a.frasco_pasteurizado_id}</Codigo> },
              { titulo: "Bebê (RN)", valor: (a) => <TextoDuplo principal={a.nome_do_rn} /> },
              { titulo: "Hospital", valor: (a) => `${a.hospital_nome} · pedido nº ${a.demanda_id}` },
              { titulo: "Tipo", valor: (a) => rotulo(a.classificacao) },
              { titulo: "Volume", valor: (a) => <Numero>{ml(a.volume)}</Numero>, direita: true },
              { titulo: "Situação", valor: (a) => <StatusBadge status={a.frasco_status} /> },
            ]}
          />
        </Card>
      )}
    </main>
  );
}

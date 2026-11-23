"use client";

import { useState, type FormEvent, type ReactNode } from "react";

import { Campo, Grupo, Marcar, Selecao } from "@/components/Field";
import { formatarCartaoSus, formatarTelefone, rotulo } from "@/lib/format";
import type { DoadoraDetalhe, Zona } from "@/types/doadora";

function mascaraSus(event: FormEvent<HTMLInputElement>) {
  event.currentTarget.value = formatarCartaoSus(event.currentTarget.value);
}

function mascaraTelefone(event: FormEvent<HTMLInputElement>) {
  event.currentTarget.value = formatarTelefone(event.currentTarget.value);
}

function Painel({ children, classe = "" }: { children: ReactNode; classe?: string }) {
  return <div className={`flex flex-col justify-between gap-5 rounded-lg border border-border bg-muted/20 p-4 ${classe}`}>{children}</div>;
}

function Secao({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-12 content-start gap-3">{children}</div>;
}

export function DoadoraFormFields({ zonas, doadora }: { zonas: Zona[]; doadora?: DoadoraDetalhe }) {
  const sim = (valor: number | undefined) => Boolean(Number(valor));

  const [transfusao, setTransfusao] = useState(sim(doadora?.transfusao_sangue));
  const [tatuagem, setTatuagem] = useState(sim(doadora?.tatuagem));
  const [fumante, setFumante] = useState(sim(doadora?.fumante));
  const [usaRemedio, setUsaRemedio] = useState(Boolean(doadora?.uso_medicacao));

  const dependente = (ativo: boolean, valor: string | number | null | undefined) => ({
    disabled: !ativo,
    required: ativo,
    defaultValue: ativo ? valor : undefined,
  });

  return (
    <div className="col-span-full grid gap-4 lg:grid-cols-12">
      <Painel classe="lg:col-span-7">
        <Secao>
          <Grupo>Mãe</Grupo>
          <Campo label="Nome completo" name="nome" required defaultValue={doadora?.nome} classe="col-span-12 sm:col-span-8" />
          <Campo label="Data de nascimento" name="data_nasc" type="date" required defaultValue={doadora?.data_nasc} classe="col-span-12 sm:col-span-4" />
          <Campo
            label="Cartão SUS"
            name="cartao_sus"
            required
            defaultValue={formatarCartaoSus(doadora?.cartao_sus)}
            placeholder="000 0000 0000 0000"
            inputMode="numeric"
            maxLength={18}
            onInput={mascaraSus}
            classe="col-span-12 sm:col-span-6"
          />
          <Campo
            label="Telefone"
            name="telefone"
            type="tel"
            defaultValue={formatarTelefone(doadora?.telefone)}
            placeholder="(14) 90000-0000"
            inputMode="tel"
            maxLength={15}
            onInput={mascaraTelefone}
            classe="col-span-12 sm:col-span-6"
          />
        </Secao>
        <Secao>
          <Grupo>Endereço e Coleta</Grupo>
          <Campo label="Rua" name="endereco_rua" defaultValue={doadora?.endereco_rua} placeholder="Ex.: Rua das Acácias" classe="col-span-12 sm:col-span-6" />
          <Campo
            label="Número"
            name="endereco_numero"
            defaultValue={doadora?.endereco_numero}
            placeholder="Ex.: 245"
            maxLength={20}
            classe="col-span-4 sm:col-span-2"
          />
          <Campo label="Bairro" name="endereco_bairro" defaultValue={doadora?.endereco_bairro} classe="col-span-8 sm:col-span-4" />
          <Selecao
            label="Zona da coleta (define o dia da busca do leite)"
            name="zona_id"
            required
            defaultValue={doadora?.zona_id}
            opcoes={zonas.map((z) => ({ valor: z.id, texto: `${z.nome} (${rotulo(z.dia_da_semana)})` }))}
            classe="col-span-12"
          />
        </Secao>
        <Secao>
          <Grupo>Bebê</Grupo>
          <Campo label="Nome do bebê" name="nome_bebe" defaultValue={doadora?.nome_bebe} classe="col-span-12 sm:col-span-8" />
          <Campo label="Data do parto" name="data_parto" type="date" required defaultValue={doadora?.data_parto} classe="col-span-12 sm:col-span-4" />
        </Secao>
      </Painel>

      <Painel classe="lg:col-span-5">
        <Secao>
          <Grupo>Vacinas em Dia</Grupo>
          <Marcar label="Febre amarela" name="vacina_febre_amarela" defaultChecked={sim(doadora?.vacina_febre_amarela)} classe="col-span-6" />
          <Marcar label="dTpa" name="vacina_dtpa" defaultChecked={sim(doadora?.vacina_dtpa)} classe="col-span-6" />
        </Secao>
        <Secao>
          <Grupo>Histórico de Saúde</Grupo>
          <Marcar label="Transfusão de sangue" name="transfusao_sangue" defaultChecked={transfusao} onMudar={setTransfusao} classe="col-span-7" />
          <Campo
            key={`transfusao-${transfusao}`}
            label="Mês/ano"
            name="data_transfusao"
            type="month"
            {...dependente(transfusao, doadora?.data_transfusao)}
            classe="col-span-5"
          />
          <Marcar label="Tem tatuagem" name="tatuagem" defaultChecked={tatuagem} onMudar={setTatuagem} classe="col-span-7" />
          <Campo
            key={`tatuagem-${tatuagem}`}
            label="Mês/ano"
            name="data_tatuagem"
            type="month"
            {...dependente(tatuagem, doadora?.data_tatuagem)}
            classe="col-span-5"
          />
        </Secao>
        <Secao>
          <Grupo>Hábitos</Grupo>
          <Marcar label="Fuma" name="fumante" defaultChecked={fumante} onMudar={setFumante} classe="col-span-7" />
          <Campo
            key={`fumante-${fumante}`}
            label="Cigarros por dia"
            name="cigarros_dia"
            type="number"
            min={0}
            {...dependente(fumante, doadora?.cigarros_dia)}
            classe="col-span-5"
          />
          <Marcar label="Usa algum remédio" name="usa_medicacao" defaultChecked={usaRemedio} onMudar={setUsaRemedio} classe="col-span-7" />
          <Campo
            key={`remedio-${usaRemedio}`}
            label="Qual remédio?"
            name="uso_medicacao"
            placeholder={usaRemedio ? "Nome do remédio" : undefined}
            {...dependente(usaRemedio, doadora?.uso_medicacao)}
            classe="col-span-5"
          />
          <Marcar label="Consome bebida alcoólica" name="consome_alcool" defaultChecked={sim(doadora?.consome_alcool)} classe="col-span-12" />
        </Secao>
      </Painel>
    </div>
  );
}

export default DoadoraFormFields;

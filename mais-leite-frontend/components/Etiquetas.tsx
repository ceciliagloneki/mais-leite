import type { ReactNode } from "react";
import { Droplets, FlaskConical } from "lucide-react";

import { formatarData, ml, rotulo, temperatura } from "@/lib/format";
import type { FrascoCru } from "@/types/coleta";
import type { FichaDistribuicao } from "@/types/distribuicao";
import type { FrascoPasteurizado } from "@/types/processamento";

const TINTA = "text-[#16303f]";
const ROTULO = "text-[10px] font-semibold uppercase tracking-wider text-[#16303f]/60";
const DIVISOR = "border-dashed border-[#16303f]/25";

const TIPO_LEITE: Record<string, { letra: string; nome: string; classe: string }> = {
  colostro: { letra: "C", nome: "Colostro", classe: "bg-amber-100 text-amber-900 border-amber-400" },
  transicao: { letra: "T", nome: "Transição", classe: "bg-orange-100 text-orange-900 border-orange-400" },
  maduro: { letra: "M", nome: "Maduro", classe: "bg-sky-100 text-sky-900 border-sky-400" },
};

function CabecalhoEtiqueta({ titulo, numero, icone: Icone }: { titulo: string; numero: number; icone: typeof Droplets }) {
  return (
    <header className="flex items-center justify-between gap-3 bg-primary px-4 py-3 text-primary-foreground">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
          <Icone className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-90">Banco de Leite Humano · Marília</p>
          <p className="text-base font-bold uppercase tracking-wide">{titulo}</p>
        </div>
      </div>
      <div className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-right leading-none text-primary">
        <p className="text-[9px] font-semibold uppercase tracking-wider">Frasco</p>
        <p className="font-mono text-xl font-bold">{String(numero).padStart(4, "0")}</p>
      </div>
    </header>
  );
}

function Dado({ rotulo: texto, valor, destaque }: { rotulo: string; valor: ReactNode; destaque?: boolean }) {
  return (
    <div className="min-w-0">
      <p className={ROTULO}>{texto}</p>
      <p className={`break-words font-semibold leading-snug ${destaque ? "text-base" : "text-sm"}`}>{valor}</p>
    </div>
  );
}

function ClassificacaoEVolume({ classificacao, volume }: { classificacao: string; volume: string | number }) {
  const tipo = TIPO_LEITE[classificacao] ?? { letra: "?", nome: rotulo(classificacao), classe: "bg-muted text-foreground border-border" };
  return (
    <section className={`grid grid-cols-[1fr_auto] items-center gap-3 border-b px-4 py-3 ${DIVISOR}`}>
      <div>
        <p className={`mb-1 ${ROTULO}`}>Classificação</p>
        <span className={`inline-flex items-center gap-2 rounded-full border-2 py-0.5 pl-0.5 pr-3 text-sm font-bold ${tipo.classe}`}>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm">{tipo.letra}</span>
          {tipo.nome}
        </span>
      </div>
      <div className="rounded-lg border-2 border-primary px-3 py-1.5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Volume</p>
        <p className="text-2xl font-bold leading-tight tabular-nums">{ml(volume)}</p>
      </div>
    </section>
  );
}

function CaixaEtiqueta({ children }: { children: ReactNode }) {
  return (
    <article
      className={`etiqueta mx-auto w-full max-w-[105mm] overflow-hidden rounded-xl border-2 border-primary bg-white shadow-sm print:shadow-none ${TINTA}`}
    >
      {children}
    </article>
  );
}

export function EtiquetaLeiteCru({ frasco }: { frasco: FrascoCru }) {
  return (
    <CaixaEtiqueta>
      <CabecalhoEtiqueta titulo="Leite Humano Cru" numero={frasco.id} icone={Droplets} />
      <section className={`border-b px-4 py-3 ${DIVISOR}`}>
        <p className={ROTULO}>Doadora</p>
        <p className="break-words text-lg font-bold uppercase leading-tight">{frasco.doadora_nome}</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <Dado rotulo="Data de nascimento" valor={formatarData(frasco.doadora_data_nasc)} />
          <Dado rotulo="1ª coleta" valor={formatarData(frasco.data_hora_primeira_coleta)} destaque />
        </div>
      </section>
      <ClassificacaoEVolume classificacao={frasco.classificacao} volume={frasco.volume_ml} />
      <section className="grid grid-cols-[1.3fr_1fr_1fr] gap-3 px-4 py-3">
        <Dado rotulo="Extração" valor={rotulo(frasco.forma_extracao)} />
        <Dado rotulo="Pré-estocagem" valor={rotulo(frasco.cond_prestocagem)} />
        <Dado rotulo="Estado" valor={rotulo(frasco.estado)} />
      </section>
      <footer className="grid grid-cols-[auto_1fr] items-start gap-4 border-t border-[#16303f]/15 bg-[#f4f1ec] px-4 py-2.5">
        <Dado rotulo="Data" valor={formatarData(frasco.data)} />
        <Dado rotulo="Responsável" valor={frasco.responsavel} />
      </footer>
    </CaixaEtiqueta>
  );
}

export function EtiquetaLeitePasteurizado({ frasco }: { frasco: FrascoPasteurizado }) {
  return (
    <CaixaEtiqueta>
      <CabecalhoEtiqueta titulo="Leite Humano Pasteurizado" numero={frasco.id} icone={FlaskConical} />
      <section className={`grid grid-cols-2 gap-3 border-b px-4 py-3 ${DIVISOR}`}>
        <Dado rotulo="Doadora" valor={`Nº ${frasco.doadora_id}`} destaque />
        <Dado rotulo="Pasteurização" valor={`Nº ${frasco.pasteurizacao_id} · ${formatarData(frasco.data_pasteurizacao)}`} destaque />
      </section>
      <ClassificacaoEVolume classificacao={frasco.classificacao} volume={frasco.volume} />
      <section className="grid grid-cols-3 gap-3 px-4 py-3">
        <Dado rotulo="Acidez Dornic" valor={frasco.dornic ? `${frasco.dornic} °D` : "—"} />
        <Dado rotulo="BGBL" valor={frasco.bgbl ? rotulo(frasco.bgbl) : "—"} />
        <Dado rotulo="Energia" valor={frasco.crematocrito_e ? `${frasco.crematocrito_e} kcal/L` : "—"} />
      </section>
      <footer className="grid grid-cols-[auto_1fr] items-start gap-4 border-t border-[#16303f]/15 bg-[#f4f1ec] px-4 py-2.5">
        <Dado rotulo="Análise" valor={frasco.data_analise ? formatarData(frasco.data_analise) : "Pendente"} />
        <Dado rotulo="Situação" valor={rotulo(frasco.status)} />
      </footer>
    </CaixaEtiqueta>
  );
}

export function FichaDistribuicaoImpressa({ ficha }: { ficha: FichaDistribuicao }) {
  const volumeTotal = ficha.frascos.reduce((s, f) => s + Number(f.volume), 0);
  return (
    <article
      className={`documento-impressao mx-auto w-full max-w-[190mm] overflow-hidden rounded-xl border-2 border-primary bg-white shadow-sm print:shadow-none ${TINTA}`}
    >
      <header className="flex items-center justify-between gap-3 bg-primary px-5 py-3 text-primary-foreground">
        <div className="leading-tight">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-90">Banco de Leite Humano · Marília</p>
          <p className="text-lg font-bold uppercase tracking-wide">Ficha de Distribuição</p>
        </div>
        <div className="rounded-lg bg-white px-2.5 py-1 text-right leading-none text-primary">
          <p className="text-[9px] font-semibold uppercase tracking-wider">Ficha</p>
          <p className="font-mono text-xl font-bold">{String(ficha.id).padStart(4, "0")}</p>
        </div>
      </header>

      <section className={`grid grid-cols-2 gap-4 border-b px-5 py-4 sm:grid-cols-4 ${DIVISOR}`}>
        <Dado rotulo="Hospital" valor={ficha.hospital_nome} destaque />
        <Dado rotulo="Setor" valor={ficha.setor} destaque />
        <Dado rotulo="Data / horário" valor={`${formatarData(ficha.data)} ${ficha.horario.slice(0, 5)}`} />
        <Dado rotulo="Caixa térmica" valor={`${ml(ficha.volume_caixa)} · ${temperatura(ficha.temperatura)}`} />
      </section>

      <section className="px-5 py-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-primary">
              <th className={`py-1.5 pr-3 ${ROTULO}`}>Nº frasco</th>
              <th className={`py-1.5 pr-3 ${ROTULO}`}>Tipo</th>
              <th className={`py-1.5 pr-3 ${ROTULO}`}>RN receptor</th>
              <th className={`py-1.5 text-right ${ROTULO}`}>Volume</th>
            </tr>
          </thead>
          <tbody>
            {ficha.frascos.map((f) => (
              <tr key={f.id} className="border-b border-[#16303f]/15">
                <td className="py-1.5 pr-3 font-mono font-bold">{f.frasco_pasteurizado_id}</td>
                <td className="py-1.5 pr-3">{rotulo(f.classificacao)}</td>
                <td className="py-1.5 pr-3 font-medium">{f.nome_do_rn}</td>
                <td className="py-1.5 text-right tabular-nums">{ml(f.volume)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="pt-2 font-semibold">
                {ficha.frascos.length} frasco{ficha.frascos.length === 1 ? "" : "s"}
              </td>
              <td className="pt-2 text-right font-bold tabular-nums">{ml(volumeTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <footer className="grid grid-cols-2 gap-8 border-t border-[#16303f]/15 bg-[#f4f1ec] px-5 pb-4 pt-10">
        {[
          { rotulo: "Quem entrega", nome: ficha.assinatura_entrega },
          { rotulo: "Quem recebe", nome: ficha.assinatura_recebimento },
        ].map((a) => (
          <div key={a.rotulo} className="border-t border-[#16303f] pt-1.5 text-center">
            <p className="text-sm font-semibold">{a.nome}</p>
            <p className={ROTULO}>{a.rotulo}</p>
          </div>
        ))}
      </footer>
    </article>
  );
}

"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, LoaderCircle, X } from "lucide-react";

import { Botao } from "@/components/Button";
import { CamposCompactos } from "@/components/Field";
import { useNotificacao } from "@/components/Notificacao";
import { lerFormulario, type DadosFormulario } from "@/lib/form";

interface FormCardProps {
  titulo: string;
  descricao?: ReactNode;
  botao?: string;
  onSubmit: (dados: DadosFormulario) => Promise<unknown>;
  onCancelar?: () => void;
  aoSalvar?: (resposta: unknown) => void;
  mensagemSucesso?: string;
  compacto?: boolean;
  semFechar?: boolean;
  preencher?: boolean;
  rodape?: ReactNode;
  children: ReactNode;
}

export function FormCard({
  titulo,
  descricao,
  botao = "Salvar",
  onSubmit,
  onCancelar,
  aoSalvar,
  mensagemSucesso = "Registro salvo com sucesso.",
  compacto = true,
  semFechar = false,
  preencher = false,
  rodape,
  children,
}: FormCardProps) {
  const notificar = useNotificacao();
  const secao = useRef<HTMLElement>(null);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const rolarAoAbrir = useRef(Boolean(onCancelar));

  useEffect(() => {
    if (rolarAoAbrir.current) secao.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setErro("");
    setSalvando(true);

    try {
      const resposta = await onSubmit(lerFormulario(form));
      form.reset();
      notificar(mensagemSucesso);
      aoSalvar?.(resposta);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section
      ref={secao}
      className={`scroll-mt-6 rounded-xl ${preencher ? "flex flex-1 flex-col" : ""} border-2 border-primary/25 bg-surface shadow-sm print:hidden`}
    >
      <form onSubmit={enviar} className={preencher ? "flex flex-1 flex-col" : ""}>
        <CamposCompactos.Provider value={compacto}>
          <div className="flex flex-col gap-3 border-b border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold leading-tight text-foreground">{titulo}</h2>
              {descricao ? <p className="text-sm text-muted-foreground">{descricao}</p> : null}
            </div>
            {onCancelar && !semFechar ? (
              <button
                type="button"
                onClick={onCancelar}
                aria-label="Fechar formulário"
                className="shrink-0 self-start rounded-md p-1.5 text-muted-foreground hover:bg-muted sm:self-center"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div
            className={`grid sm:grid-cols-2 ${compacto ? "" : "xl:grid-cols-3"} ${preencher ? "flex-1 grid-rows-[1fr_auto]" : ""} ${compacto ? "gap-4 px-5 py-4" : "gap-5 px-6 py-6"}`}
          >
            {children}

            {erro ? (
              <div role="alert" className="col-span-full flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 p-4 text-base text-danger">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <span>
                  <strong className="block">Não foi possível salvar.</strong>
                  {erro}
                </span>
              </div>
            ) : null}

            <div
              className={`col-span-full flex flex-col-reverse gap-3 border-t border-border sm:flex-row sm:items-center sm:justify-end ${compacto ? "pt-4" : "pt-5"}`}
            >
              <p className="text-sm text-muted-foreground sm:mr-auto">
                Campos com <span className="text-danger">*</span> são obrigatórios.
              </p>
              {rodape ? <div className="order-last sm:order-none">{rodape}</div> : null}
              {onCancelar ? (
                <Botao pequeno variante="secundario" onClick={onCancelar}>
                  Cancelar
                </Botao>
              ) : null}
              <Botao pequeno type="submit" disabled={salvando} className="sm:min-w-40">
                {salvando ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {salvando ? "Salvando…" : botao}
              </Botao>
            </div>
          </div>
        </CamposCompactos.Provider>
      </form>
    </section>
  );
}

export default FormCard;

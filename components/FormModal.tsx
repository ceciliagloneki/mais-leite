"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";

import { Botao } from "@/components/Button";
import { CamposCompactos } from "@/components/Field";
import { Modal, type TamanhoModal } from "@/components/Modal";
import { useNotificacao } from "@/components/Notificacao";
import { lerFormulario, type DadosFormulario } from "@/lib/form";

interface FormModalProps {
  titulo: ReactNode;
  descricao?: ReactNode;
  botao?: string;
  onSubmit: (dados: DadosFormulario) => Promise<unknown>;
  onFechar: () => void;
  aoSalvar?: (resposta: unknown) => void;
  mensagemSucesso?: string;
  tamanho?: TamanhoModal;
  grade?: boolean;
  rodape?: ReactNode;
  children: ReactNode;
}

export function FormModal({
  titulo,
  descricao,
  botao = "Salvar",
  onSubmit,
  onFechar,
  aoSalvar,
  mensagemSucesso = "Registro salvo com sucesso.",
  tamanho = "md",
  grade = true,
  rodape,
  children,
}: FormModalProps) {
  const formId = useId();
  const notificar = useNotificacao();
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      const resposta = await onSubmit(lerFormulario(event.currentTarget));
      if (mensagemSucesso) notificar(mensagemSucesso);
      aoSalvar?.(resposta);
      onFechar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar.");
      setSalvando(false);
    }
  }

  return (
    <Modal
      titulo={titulo}
      descricao={descricao}
      tamanho={tamanho}
      onFechar={onFechar}
      rodape={
        <>
          {rodape ? <div className="mr-auto text-sm">{rodape}</div> : null}
          <Botao pequeno variante="secundario" onClick={onFechar}>
            Cancelar
          </Botao>
          <Botao pequeno type="submit" form={formId} disabled={salvando} className="sm:min-w-40">
            {salvando ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {salvando ? "Salvando…" : botao}
          </Botao>
        </>
      }
    >
      <form id={formId} onSubmit={enviar} className="flex flex-col gap-5 px-5 py-5">
        <CamposCompactos.Provider value={true}>{grade ? <div className="grid gap-4 sm:grid-cols-2">{children}</div> : children}</CamposCompactos.Provider>
        <p className="text-xs text-muted-foreground">
          Campos com <span className="text-danger">*</span> são obrigatórios.
        </p>
        {erro ? (
          <div role="alert" className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              <strong className="block">Não foi possível salvar.</strong>
              {erro}
            </span>
          </div>
        ) : null}
      </form>
    </Modal>
  );
}

interface ConfirmarModalProps {
  titulo: string;
  children: ReactNode;
  botao: string;
  onConfirmar: () => Promise<unknown>;
  onFechar: () => void;
  mensagemSucesso?: string;
  perigo?: boolean;
}

export function ConfirmarModal({ titulo, children, botao, onConfirmar, onFechar, mensagemSucesso, perigo = true }: ConfirmarModalProps) {
  const notificar = useNotificacao();
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function confirmar() {
    setErro("");
    setEnviando(true);
    try {
      await onConfirmar();
      if (mensagemSucesso) notificar(mensagemSucesso);
      onFechar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível concluir.");
      setEnviando(false);
    }
  }

  return (
    <Modal
      titulo={titulo}
      tamanho="sm"
      onFechar={onFechar}
      rodape={
        <>
          <Botao pequeno variante="secundario" onClick={onFechar}>
            Voltar
          </Botao>
          <Botao pequeno variante={perigo ? "perigo" : "primario"} onClick={confirmar} disabled={enviando}>
            {enviando ? "Aguarde…" : botao}
          </Botao>
        </>
      }
    >
      <div className="flex flex-col gap-3 px-5 py-5 text-sm text-foreground">
        {children}
        {erro ? <p className="text-danger">{erro}</p> : null}
      </div>
    </Modal>
  );
}

export default FormModal;

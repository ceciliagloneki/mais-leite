"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Printer, X } from "lucide-react";

import { Botao } from "@/components/Button";

const TAMANHOS = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-5xl",
} as const;

export type TamanhoModal = keyof typeof TAMANHOS;

const pilha: string[] = [];

interface ModalProps {
  titulo: ReactNode;
  descricao?: ReactNode;
  onFechar: () => void;
  tamanho?: TamanhoModal;
  rodape?: ReactNode;
  classe?: string;
  children: ReactNode;
}

export function Modal({ titulo, descricao, onFechar, tamanho = "md", rodape, classe = "", children }: ModalProps) {
  const id = useId();
  const caixa = useRef<HTMLDivElement>(null);
  const fechar = useRef(onFechar);
  fechar.current = onFechar;
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    pilha.push(id);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focoAnterior = document.activeElement as HTMLElement | null;

    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape" && pilha[pilha.length - 1] === id) {
        e.preventDefault();
        fechar.current();
      }
    }
    window.addEventListener("keydown", aoTeclar);

    return () => {
      window.removeEventListener("keydown", aoTeclar);
      pilha.splice(pilha.indexOf(id), 1);
      if (pilha.length === 0) document.body.style.overflow = overflowAnterior;
      focoAnterior?.focus?.();
    };
  }, [id]);

  useEffect(() => {
    if (montado) caixa.current?.focus();
  }, [montado]);

  if (!montado) return null;

  return createPortal(
    <div className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 sm:p-6 ${classe}`}>
      <div className="modal-fundo fixed inset-0 bg-foreground/50 backdrop-blur-[2px]" onClick={onFechar} aria-hidden="true" />
      <div
        ref={caixa}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-titulo`}
        tabIndex={-1}
        className={`modal-caixa relative my-auto flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl outline-none sm:max-h-[calc(100dvh-3rem)] ${TAMANHOS[tamanho]}`}
      >
        <header className="modal-cabecalho flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 id={`${id}-titulo`} className="text-xl font-semibold leading-tight text-foreground">
              {titulo}
            </h2>
            {descricao ? <p className="mt-0.5 text-sm text-muted-foreground">{descricao}</p> : null}
          </div>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>
        <div className="modal-corpo min-h-0 flex-1 overflow-y-auto">{children}</div>
        {rodape ? (
          <footer className="modal-rodape flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-border bg-muted/40 px-5 py-3">{rodape}</footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

interface ImpressaoModalProps {
  titulo: ReactNode;
  descricao?: ReactNode;
  onFechar: () => void;
  tamanho?: TamanhoModal;
  children: ReactNode;
}

export function ImpressaoModal({
  titulo,
  descricao = "Confira os dados antes de imprimir. Só o documento sai na impressão.",
  onFechar,
  tamanho = "md",
  children,
}: ImpressaoModalProps) {
  return (
    <Modal
      titulo={titulo}
      descricao={descricao}
      tamanho={tamanho}
      classe="print-modal"
      onFechar={onFechar}
      rodape={
        <>
          <Botao pequeno variante="secundario" onClick={onFechar}>
            Fechar
          </Botao>
          <Botao pequeno icone={Printer} onClick={() => window.print()}>
            Imprimir
          </Botao>
        </>
      }
    >
      <div className="bg-muted/40 px-5 py-6">{children}</div>
    </Modal>
  );
}

export default Modal;

"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import type { Doadora, Doadora_Status } from "@/types/doadora";

// Form payload for creating a new donor. Omits the server-generated id.
export type NovaDoadoraInput = Omit<Doadora, "id">;

interface DonorSheetProps {
  open: boolean;
  onClose: () => void;
  // Called with the validated form data when the user submits. For now the
  // page simply closes the sheet; wiring to the API is a later step.
  onSubmit: (data: NovaDoadoraInput) => void;
}

const STATUS_OPTIONS: Doadora_Status[] = [
  "Ativa",
  "Em Triagem",
  "Suspensa",
  "Inativa",
];

const EMPTY_FORM: NovaDoadoraInput = {
  nome: "",
  cartaoSus: "",
  telefone: "",
  zona: "",
  dataCadastro: "",
  status: "Em Triagem",
  quantidadeColetas: 0,
};

type FieldErrors = Partial<Record<keyof NovaDoadoraInput, string>>;

function validate(form: NovaDoadoraInput): FieldErrors {
  const errors: FieldErrors = {};
  if (form.nome.trim() === "") errors.nome = "Informe o nome da doadora.";
  if (form.cartaoSus.trim() === "")
    errors.cartaoSus = "Informe o Cartão SUS.";
  if (form.telefone.trim() === "") errors.telefone = "Informe o telefone.";
  if (form.zona.trim() === "") errors.zona = "Informe a zona.";
  if (form.dataCadastro.trim() === "")
    errors.dataCadastro = "Informe a data de cadastro.";
  if (Number.isNaN(form.quantidadeColetas) || form.quantidadeColetas < 0)
    errors.quantidadeColetas = "Quantidade inválida.";
  return errors;
}

const labelClass = "text-sm font-medium text-foreground";
const inputClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const errorClass = "text-xs text-danger";

// Lateral sheet containing the "Nova Doadora" registration form. Rendered as a
// right-side panel with a dimmed overlay. Submitting runs local validation and,
// when valid, calls onSubmit; wiring to the API happens in a later step.
export function DonorSheet({ open, onClose, onSubmit }: DonorSheetProps) {
  const [form, setForm] = useState<NovaDoadoraInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Reset the form each time the sheet opens so it starts clean.
  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  }, [open]);

  // Close on Escape for keyboard accessibility.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function setField<K extends keyof NovaDoadoraInput>(
    key: K,
    value: NovaDoadoraInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Nova Doadora">
      {/* Overlay */}
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      {/* Panel */}
      <div className="relative flex h-full w-full max-w-md flex-col bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-foreground">
              Nova Doadora
            </h2>
            <p className="text-sm text-muted-foreground">
              Preencha as informações para cadastrar uma nova doadora.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nome" className={labelClass}>
              Nome
            </label>
            <input
              id="nome"
              className={inputClass}
              value={form.nome}
              onChange={(e) => setField("nome", e.target.value)}
            />
            {errors.nome ? <span className={errorClass}>{errors.nome}</span> : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="cartaoSus" className={labelClass}>
              Cartão SUS
            </label>
            <input
              id="cartaoSus"
              className={inputClass}
              value={form.cartaoSus}
              onChange={(e) => setField("cartaoSus", e.target.value)}
            />
            {errors.cartaoSus ? (
              <span className={errorClass}>{errors.cartaoSus}</span>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="telefone" className={labelClass}>
              Telefone
            </label>
            <input
              id="telefone"
              className={inputClass}
              value={form.telefone}
              onChange={(e) => setField("telefone", e.target.value)}
            />
            {errors.telefone ? (
              <span className={errorClass}>{errors.telefone}</span>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="zona" className={labelClass}>
              Zona
            </label>
            <input
              id="zona"
              className={inputClass}
              value={form.zona}
              onChange={(e) => setField("zona", e.target.value)}
            />
            {errors.zona ? <span className={errorClass}>{errors.zona}</span> : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="dataCadastro" className={labelClass}>
              Data de cadastro
            </label>
            <input
              id="dataCadastro"
              type="date"
              className={inputClass}
              value={form.dataCadastro}
              onChange={(e) => setField("dataCadastro", e.target.value)}
            />
            {errors.dataCadastro ? (
              <span className={errorClass}>{errors.dataCadastro}</span>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select
              id="status"
              className={inputClass}
              value={form.status}
              onChange={(e) =>
                setField("status", e.target.value as Doadora_Status)
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="quantidadeColetas" className={labelClass}>
              Quantidade de coletas
            </label>
            <input
              id="quantidadeColetas"
              type="number"
              min={0}
              className={inputClass}
              value={form.quantidadeColetas}
              onChange={(e) =>
                setField("quantidadeColetas", e.target.valueAsNumber)
              }
            />
            {errors.quantidadeColetas ? (
              <span className={errorClass}>{errors.quantidadeColetas}</span>
            ) : null}
          </div>

          <div className="mt-auto flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DonorSheet;

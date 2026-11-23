"use client";

import { createContext, useContext, useRef, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export const CamposCompactos = createContext(false);

function useClasses() {
  const compacto = useContext(CamposCompactos);
  return {
    compacto,
    input: `${compacto ? "mt-1 h-10 text-sm" : "mt-1.5 h-12 text-base"} w-full rounded-lg border border-input bg-surface px-3 text-foreground placeholder:text-muted-foreground/70 disabled:cursor-default`,
  };
}

function Rotulo({ texto, required, desativado }: { texto: string; required?: boolean; desativado?: boolean }) {
  const compacto = useContext(CamposCompactos);
  return (
    <span className={`${compacto ? "text-sm" : "text-base"} font-medium ${desativado ? "text-muted-foreground" : "text-foreground"}`}>
      {texto}
      {required ? (
        <span className="ml-0.5 text-danger" aria-hidden="true">
          {" "}
          *
        </span>
      ) : null}
    </span>
  );
}

function Ajuda({ texto }: { texto?: string }) {
  return texto ? <span className="mt-1 block text-sm text-muted-foreground">{texto}</span> : null;
}

interface CampoProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number | null;
  step?: string;
  min?: number | string;
  max?: number | string;
  placeholder?: string;
  ajuda?: string;
  largo?: boolean;
  classe?: string;
  disabled?: boolean;
  inputMode?: "numeric" | "tel" | "text";
  maxLength?: number;
  onInput?: (event: FormEvent<HTMLInputElement>) => void;
}

export function Campo({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  step,
  min,
  max,
  placeholder,
  ajuda,
  largo,
  classe = "",
  disabled,
  inputMode,
  maxLength,
  onInput,
}: CampoProps) {
  const { input } = useClasses();
  return (
    <label className={`block transition-opacity duration-200 ${disabled ? "opacity-40" : "opacity-100"} ${largo ? "col-span-full" : ""} ${classe}`}>
      <Rotulo texto={label} required={required && !disabled} />
      <input
        name={name}
        type={type}
        required={required && !disabled}
        disabled={disabled}
        defaultValue={defaultValue ?? undefined}
        step={step ?? (type === "number" ? "any" : undefined)}
        min={min}
        max={max}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        onInput={onInput}
        className={input}
      />
      <Ajuda texto={ajuda} />
    </label>
  );
}

export function ValorFixo({ rotulo: texto, valor, ajuda, largo }: { rotulo: string; valor: ReactNode; ajuda?: string; largo?: boolean }) {
  const { compacto } = useClasses();
  return (
    <div className={`block ${largo ? "col-span-full" : ""}`}>
      <Rotulo texto={texto} />
      <div
        className={`${compacto ? "mt-1 h-10 text-sm" : "mt-1.5 h-12 text-base"} flex w-full items-center gap-2 rounded-lg border border-dashed border-input bg-muted/50 px-3 font-semibold text-foreground`}
        aria-readonly="true"
      >
        {valor}
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">automático</span>
      </div>
      <Ajuda texto={ajuda} />
    </div>
  );
}

interface SelecaoProps {
  label: string;
  name: string;
  opcoes: { valor: string | number; texto: string }[];
  required?: boolean;
  defaultValue?: string | number | null;
  ajuda?: string;
  largo?: boolean;
  classe?: string;
}

export function Selecao({ label, name, opcoes, required, defaultValue, ajuda, largo, classe = "" }: SelecaoProps) {
  const { input, compacto } = useClasses();
  return (
    <label className={`block ${largo ? "col-span-full" : ""} ${classe}`}>
      <Rotulo texto={label} required={required} />
      <span className="relative block">
        <select
          key={`${opcoes.length}-${defaultValue ?? ""}`}
          name={name}
          required={required}
          defaultValue={defaultValue ?? ""}
          className={`${input} appearance-none pr-10`}
        >
          <option value="">{opcoes.length === 0 ? "Nenhuma opção disponível" : "Selecione…"}</option>
          {opcoes.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.texto}
            </option>
          ))}
        </select>
        <ChevronDown
          className={`pointer-events-none absolute right-3.5 h-4 w-4 text-muted-foreground ${compacto ? "top-[calc(50%+2px)]" : "top-[calc(50%+3px)]"} -translate-y-1/2`}
          aria-hidden="true"
        />
      </span>
      <Ajuda texto={ajuda} />
    </label>
  );
}

interface MarcarProps {
  label: string;
  name: string;
  defaultChecked?: boolean;
  classe?: string;
  onMudar?: (marcado: boolean) => void;
}

export function Marcar({ label, name, defaultChecked, classe = "", onMudar }: MarcarProps) {
  const compacto = useContext(CamposCompactos);
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 self-end rounded-lg border border-border bg-muted/50 text-foreground hover:bg-muted has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5 ${
        compacto ? "min-h-10 px-3 py-2 text-sm" : "min-h-12 px-4 py-2.5 text-base"
      } ${classe}`}
    >
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        onChange={onMudar ? (e: ChangeEvent<HTMLInputElement>) => onMudar(e.target.checked) : undefined}
        className={`${compacto ? "h-4 w-4" : "h-5 w-5"} shrink-0 accent-[hsl(var(--primary))]`}
      />
      {label}
    </label>
  );
}

interface SimNaoProps {
  label: string;
  name: string;
  required?: boolean;
  textoSim?: string;
  textoNao?: string;
  valorSim?: string;
  valorNao?: string;
  ajuda?: string;
}

export function SimNao({ label, name, required, textoSim = "Sim", textoNao = "Não", valorSim = "1", valorNao = "0", ajuda }: SimNaoProps) {
  const compacto = useContext(CamposCompactos);
  const opcao = (valor: string, texto: string, cor: string) => (
    <label className="flex-1 cursor-pointer">
      <input type="radio" name={name} value={valor} required={required} className="peer sr-only" />
      <span
        className={`flex ${compacto ? "min-h-10 py-1.5 text-sm" : "min-h-12 py-2 text-base"} items-center justify-center rounded-lg border-2 border-input bg-surface px-4 text-center font-medium text-foreground transition-colors hover:bg-muted peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring ${cor}`}
      >
        {texto}
      </span>
    </label>
  );

  return (
    <fieldset className="col-span-full">
      <legend className={compacto ? "mb-1" : "mb-1.5"}>
        <Rotulo texto={label} required={required} />
      </legend>
      <div className={`flex flex-col sm:flex-row ${compacto ? "gap-2" : "gap-3"}`}>
        {opcao(valorSim, textoSim, "peer-checked:border-success peer-checked:bg-success/10 peer-checked:text-success")}
        {opcao(valorNao, textoNao, "peer-checked:border-danger peer-checked:bg-danger/10 peer-checked:text-danger")}
      </div>
      <Ajuda texto={ajuda} />
    </fieldset>
  );
}

interface ListaMarcarProps {
  label: string;
  name: string;
  itens: { valor: number; texto: string }[];
  vazio?: string;
}

export function ListaMarcar({ label, name, itens, vazio = "Nenhum item disponível no momento." }: ListaMarcarProps) {
  const lista = useRef<HTMLDivElement>(null);

  function marcarTodos(marcado: boolean) {
    lista.current?.querySelectorAll<HTMLInputElement>("input[type=checkbox]").forEach((input) => {
      input.checked = marcado;
    });
  }

  return (
    <fieldset className="col-span-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <legend>
          <Rotulo texto={label} required />
        </legend>
        {itens.length > 1 ? (
          <div className="flex gap-4 text-base">
            <button type="button" onClick={() => marcarTodos(true)} className="font-medium text-primary hover:underline">
              Marcar todos
            </button>
            <button type="button" onClick={() => marcarTodos(false)} className="font-medium text-muted-foreground hover:underline">
              Desmarcar todos
            </button>
          </div>
        ) : null}
      </div>
      {itens.length === 0 ? (
        <p className="mt-2 rounded-lg border border-dashed border-input p-4 text-base text-muted-foreground">{vazio}</p>
      ) : (
        <div ref={lista} className="mt-2 grid max-h-80 gap-2 overflow-y-auto rounded-lg border border-border bg-muted/30 p-3 md:grid-cols-2">
          {itens.map((item) => (
            <label
              key={item.valor}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-base hover:bg-muted has-[:checked]:border-primary/60 has-[:checked]:bg-primary/5"
            >
              <input type="checkbox" name={name} value={item.valor} className="h-5 w-5 shrink-0 accent-[hsl(var(--primary))]" />
              {item.texto}
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}

export function Grupo({ children, descricao }: { children: ReactNode; descricao?: string }) {
  const compacto = useContext(CamposCompactos);
  if (compacto) {
    return (
      <div className="col-span-full mt-4 first:mt-0">
        <h3 className="text-sm font-bold uppercase tracking-wider text-primary">{children}</h3>
        {descricao ? <p className="text-xs text-muted-foreground">{descricao}</p> : null}
      </div>
    );
  }
  return (
    <div className="col-span-full mt-3 border-b border-border pb-2 first:mt-0">
      <h3 className="text-lg font-semibold text-foreground">{children}</h3>
      {descricao ? <p className="text-sm text-muted-foreground">{descricao}</p> : null}
    </div>
  );
}

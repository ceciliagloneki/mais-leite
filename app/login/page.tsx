"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AlertCircle, ArrowRight, Eye, EyeOff, Heart, LoaderCircle, Lock, Mail } from "lucide-react";

import { AuthBrand } from "@/components/AuthBrand";
import { Logo } from "@/components/Logo";
import { saveAuthentication, type LoginResponse } from "@/lib/auth";
import { api } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    senha?: string;
    form?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!email.trim()) nextErrors.email = "Informe seu e-mail.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Informe um e-mail válido.";
    if (!senha) nextErrors.senha = "Informe sua senha.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const login = await api<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, senha }),
      });
      saveAuthentication(login);
      router.replace("/dashboard");
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : "Não foi possível entrar. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-input bg-white pl-11 pr-3.5 text-base text-foreground transition placeholder:text-muted-foreground/60 focus:border-primary aria-[invalid=true]:border-danger";

  return (
    <main className="min-h-screen bg-[#FFF7EA] lg:flex">
      <AuthBrand />
      <section className="relative flex min-h-screen flex-1 flex-col items-center justify-center overflow-hidden px-5 py-10 sm:px-12">
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#8CC8D1] opacity-25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#EFA69A] opacity-25 blur-3xl" />

        <div className="relative w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo tamanho="md" />
          </div>

          <div className="rounded-3xl border border-[#285C68]/10 bg-white p-7 shadow-[0_20px_60px_-20px_rgba(40,92,104,0.35)] sm:p-9">
            <h2 className="text-3xl font-bold text-[#263238]">Entrar</h2>
            <p className="mt-1.5 text-base text-muted-foreground">Acesse com o e-mail e a senha cadastrados pela equipe.</p>

            <form className="mt-7 space-y-5" noValidate onSubmit={submit}>
              {errors.form && (
                <p role="alert" className="flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/10 p-3.5 text-sm text-danger">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {errors.form}
                </p>
              )}
              <label className="block text-sm font-semibold text-[#263238]">
                E-mail
                <span className="relative mt-1.5 block">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="seu.nome@exemplo.com"
                    className={inputClass}
                    aria-invalid={!!errors.email}
                  />
                </span>
                {errors.email && <span className="mt-1.5 block text-sm font-normal text-danger">{errors.email}</span>}
              </label>
              <label className="block text-sm font-semibold text-[#263238]">
                Senha
                <span className="relative mt-1.5 block">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <input
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Sua senha"
                    className={`${inputClass} pr-12`}
                    aria-invalid={!!errors.senha}
                  />
                  <button
                    className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                  </button>
                </span>
                {errors.senha && <span className="mt-1.5 block text-sm font-normal text-danger">{errors.senha}</span>}
              </label>
              <button
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#285C68] text-base font-semibold text-white shadow-sm transition hover:bg-[#1f4b55] disabled:opacity-60"
                type="submit"
              >
                {loading ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
                {loading ? "Entrando…" : "Entrar"}
                {loading ? null : <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">Esqueceu a senha? Fale com o administrador do banco de leite.</p>
          </div>

          <p className="mt-8 flex items-center justify-center gap-1.5 text-sm text-[#285C68]/80">
            <span>
              “Cuidado que gera <span className="font-semibold text-[#e0806f]">vida</span>.”
            </span>
            <Heart className="h-4 w-4 fill-[#EFA69A] text-[#EFA69A]" aria-hidden="true" />
          </p>
        </div>
      </section>
    </main>
  );
}

import { Search, ShieldCheck, Snowflake } from "lucide-react";

import { Logo, LogoIcone } from "@/components/Logo";

const DESTAQUES = [
  { icone: Snowflake, titulo: "Cadeia de frio", texto: "Do congelador da doadora até o hospital" },
  { icone: Search, titulo: "Rastreabilidade", texto: "Cada frasco, da doadora ao bebê" },
  { icone: ShieldCheck, titulo: "Conformidade", texto: "Segue a ANVISA RDC 171/2006" },
];

export function AuthBrand() {
  return (
    <aside className="relative hidden min-h-screen overflow-hidden bg-[linear-gradient(155deg,#2f6b78_0%,#285C68_45%,#1d4651_100%)] p-12 text-white lg:flex lg:w-1/2 lg:flex-col xl:p-16">
      <div className="pointer-events-none absolute -right-24 -top-16 opacity-[0.07]">
        <LogoIcone tamanho={420} claro />
      </div>
      <div className="pointer-events-none absolute -bottom-20 left-1/3 opacity-[0.05]">
        <LogoIcone tamanho={300} claro />
      </div>
      <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-[#EFA69A] opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-64 w-64 rounded-full bg-[#8CC8D1] opacity-20 blur-3xl" />

      <div className="relative">
        <Logo claro tamanho="lg" />
      </div>

      <div className="relative mt-auto max-w-lg">
        <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
          Gestão do Banco de Leite Humano
          <span className="block text-[#EFA69A]">de Marília</span>
        </h1>
        <p className="mt-5 text-lg leading-8 text-white/75">Do cadastro da doadora à entrega no hospital, cada frasco acompanhado com segurança.</p>

        <ul className="mt-10 flex flex-col gap-3">
          {DESTAQUES.map((d) => {
            const Icone = d.icone;
            return (
              <li key={d.titulo} className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-3 backdrop-blur-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFA69A]/20 text-[#EFA69A]">
                  <Icone className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-base font-semibold">{d.titulo}</span>
                  <span className="block text-sm text-white/65">{d.texto}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="relative mt-12 text-sm text-white/55">Banco de Leite Humano de Marília · Rede Brasileira de Bancos de Leite Humano</p>
    </aside>
  );
}

export default AuthBrand;

import { useId } from "react";

const CORES_MARCA = {
  petroleo: "#285C68",
  agua: "#8CC8D1",
  coral: "#EFA69A",
  creme: "#FFF7EA",
  grafite: "#263238",
};

export function LogoIcone({ tamanho = 40, claro = false, className = "" }: { tamanho?: number; claro?: boolean; className?: string }) {
  const id = useId().replace(/:/g, "");
  const gota = claro ? CORES_MARCA.creme : CORES_MARCA.petroleo;
  const contorno = claro ? CORES_MARCA.petroleo : CORES_MARCA.creme;

  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 48 48" fill="none" aria-hidden="true" overflow="visible" className={className}>
      <defs>
        <clipPath id={`gota-${id}`}>
          <path d="M22 5C22 5 7 21.5 7 31a15 15 0 0 0 30 0C37 21.5 22 5 22 5Z" />
        </clipPath>
      </defs>
      <path d="M22 5C22 5 7 21.5 7 31a15 15 0 0 0 30 0C37 21.5 22 5 22 5Z" fill={gota} />
      <g clipPath={`url(#gota-${id})`}>
        <path d="M4 32c5-4.5 10-4.5 15 0s10 4.5 15 0 7-3 9-2V50H4Z" fill={CORES_MARCA.agua} />
        <path d="M4 37c5-3.5 10-3.5 15 0s10 3.5 15 0 7-2.5 9-1.5V50H4Z" fill={claro ? "#ffffff" : CORES_MARCA.creme} opacity="0.55" />
      </g>
      <path
        d="M14.5 27.5c.6-3.2 2.4-6.6 4.6-9.6"
        stroke={claro ? CORES_MARCA.petroleo : "#ffffff"}
        strokeOpacity="0.35"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <g stroke={contorno} strokeWidth="5" strokeLinejoin="round">
        <rect x="32" y="4" width="7" height="20" rx="2.5" fill={contorno} />
        <rect x="25.5" y="10.5" width="20" height="7" rx="2.5" fill={contorno} />
      </g>
      <rect x="32" y="4" width="7" height="20" rx="2.5" fill={CORES_MARCA.coral} />
      <rect x="25.5" y="10.5" width="20" height="7" rx="2.5" fill={CORES_MARCA.coral} />
    </svg>
  );
}

export function Logo({ claro = false, tamanho = "md", slogan = true }: { claro?: boolean; tamanho?: "sm" | "md" | "lg"; slogan?: boolean }) {
  const icone = { sm: 34, md: 44, lg: 72 }[tamanho];
  const texto = { sm: "text-xl", md: "text-2xl", lg: "text-5xl" }[tamanho];
  const frase = { sm: "text-[9px]", md: "text-[10px]", lg: "text-xs" }[tamanho];

  return (
    <span className="inline-flex items-center gap-3">
      <LogoIcone tamanho={icone} claro={claro} className="shrink-0" />
      <span className="flex flex-col leading-none">
        <span className={`${texto} font-bold tracking-tight`} style={{ color: claro ? "#ffffff" : CORES_MARCA.petroleo }}>
          <span style={{ color: CORES_MARCA.coral }}>+</span>Leite
        </span>
        {slogan ? (
          <span
            className={`${frase} mt-1.5 font-semibold uppercase tracking-[0.22em]`}
            style={{ color: claro ? CORES_MARCA.agua : CORES_MARCA.petroleo, opacity: claro ? 1 : 0.75 }}
          >
            Cuidado que gera vida
          </span>
        ) : null}
      </span>
    </span>
  );
}

export default Logo;

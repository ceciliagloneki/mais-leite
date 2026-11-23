const ROTULOS: Record<string, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  em_triagem: "Em triagem",
  ativa: "Ativa",
  inapta: "Inapta",
  removida: "Removida",
  coletado: "Coletado",
  conforme: "Conforme",
  descartado: "Descartado",
  pasteurizado: "Pasteurizado",
  quarentena: "Quarentena",
  disponivel: "Disponível",
  reprovado: "Reprovado",
  alocado: "Alocado",
  distribuido: "Distribuído",
  bloqueado: "Bloqueado",
  pendente: "Pendente",
  atendida: "Atendida",
  agendada: "Agendada",
  realizada: "Realizada",
  cancelada: "Cancelada",
  colostro: "Colostro (C)",
  transicao: "Transição (T)",
  maduro: "Maduro (M)",
  manual: "Manual",
  mecanica_manual: "Mecânica manual",
  mecanica_eletrica: "Mecânica elétrica",
  congelador: "Congelador",
  freezer: "Freezer",
  refrigerador: "Refrigerador",
  duplex: "Duplex",
  refrigerado: "Refrigerado",
  congelado: "Congelado",
  misto: "Misto",
  normal: "Normal",
  alterado: "Alterado",
  negativo: "Negativo",
  positivo: "Positivo",
  tampa_plastica_500ml: "Tampa plástica 500 mL",
  graduado_200ml: "Graduado 200 mL",
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
};

export function rotulo(valor: string | null | undefined): string {
  if (!valor) return "—";
  return ROTULOS[valor] ?? valor;
}

export function formatarData(valor: string | null | undefined): string {
  if (!valor) return "—";
  const [data, hora] = valor.split(/[ T]/);
  const [ano, mes, dia] = data.split("-");
  if (!dia) return `${mes}/${ano}`;
  return `${dia}/${mes}/${ano}` + (hora ? ` ${hora.slice(0, 5)}` : "");
}

export function simNao(valor: boolean | number | string | null | undefined): string {
  return Number(valor) ? "Sim" : "Não";
}

export function ml(valor: number | string | null | undefined): string {
  return `${Number(valor ?? 0).toLocaleString("pt-BR")} mL`;
}

export function opcoes(valores: string[]): { valor: string; texto: string }[] {
  return valores.map((valor) => ({ valor, texto: rotulo(valor) }));
}

export function hoje(): string {
  const agora = new Date();
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
  return agora.toISOString().slice(0, 10);
}

export function agora(): string {
  const data = new Date();
  data.setMinutes(data.getMinutes() - data.getTimezoneOffset());
  return data.toISOString().slice(0, 16);
}

export function horaAtual(): string {
  return agora().slice(11, 16);
}

export function dataPorExtenso(data = new Date()): string {
  const texto = data.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function saudacao(data = new Date()): string {
  const hora = data.getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export function contem(texto: string | number | null | undefined, busca: string): boolean {
  const normalizar = (valor: string) => valor.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  return normalizar(String(texto ?? "")).includes(normalizar(busca.trim()));
}

export function formatarCartaoSus(valor: string | null | undefined): string {
  const numeros = String(valor ?? "")
    .replace(/\D/g, "")
    .slice(0, 15);
  return [numeros.slice(0, 3), numeros.slice(3, 7), numeros.slice(7, 11), numeros.slice(11, 15)].filter(Boolean).join(" ");
}

export function formatarTelefone(valor: string | null | undefined): string {
  const n = String(valor ?? "")
    .replace(/\D/g, "")
    .slice(0, 11);
  if (n.length === 0) return "";
  if (n.length <= 2) return `(${n}`;
  const meio = n.length === 11 ? 5 : 4;
  const resto = n.slice(2);
  if (resto.length <= meio) return `(${n.slice(0, 2)}) ${resto}`;
  return `(${n.slice(0, 2)}) ${resto.slice(0, meio)}-${resto.slice(meio)}`;
}

export function anosDesde(valor: string | null | undefined): number | null {
  const meses = mesesDesde(valor);
  return meses === null ? null : Math.floor(meses / 12);
}

export function mesesDesde(valor: string | null | undefined): number | null {
  if (!valor) return null;
  const [ano, mes, dia] = valor.slice(0, 10).split("-").map(Number);
  if (!ano || !mes || !dia) return null;
  const agora = new Date();
  let meses = (agora.getFullYear() - ano) * 12 + (agora.getMonth() + 1 - mes);
  if (agora.getDate() < dia) meses -= 1;
  return Math.max(meses, 0);
}

export function idadeBebe(valor: string | null | undefined): string {
  const meses = mesesDesde(valor);
  if (meses === null) return "";
  if (meses === 0) {
    const dias = Math.max(Math.floor((Date.now() - new Date(`${valor!.slice(0, 10)}T00:00:00`).getTime()) / 86_400_000), 0);
    return dias === 1 ? "1 dia" : `${dias} dias`;
  }
  if (meses < 12) return meses === 1 ? "1 mês" : `${meses} meses`;
  const anos = Math.floor(meses / 12);
  const resto = meses % 12;
  const textoAnos = anos === 1 ? "1 ano" : `${anos} anos`;
  return resto ? `${textoAnos} e ${resto === 1 ? "1 mês" : `${resto} meses`}` : textoAnos;
}

export function enderecoCompleto(rua?: string | null, numero?: string | null, bairro?: string | null): string {
  const linha = [rua, numero].filter(Boolean).join(", ");
  return [linha, bairro].filter(Boolean).join(" — ") || "—";
}

export function temperatura(valor: number | string | null | undefined): string {
  if (valor === null || valor === undefined || valor === "") return "—";
  return `${Number(valor).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} °C`;
}

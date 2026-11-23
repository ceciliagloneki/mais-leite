import type { TipoLeite } from "@/types/doadora";

export const DIAS_DA_SEMANA = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
const UM_DIA = 86_400_000;

export function dataLocal(data: Date): string {
  const local = new Date(data);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().slice(0, 10);
}

export function somarDias(data: string, dias: number): string {
  return dataLocal(new Date(new Date(`${data}T12:00:00`).getTime() + dias * UM_DIA));
}

export function diaDeHoje(): string {
  return DIAS_DA_SEMANA[new Date().getDay()];
}

export function proximasDatasDaZona(diaDaZona: string, quantidade = 6): string[] {
  const alvo = DIAS_DA_SEMANA.indexOf(diaDaZona);
  if (alvo < 0) return [];
  const hojeData = new Date();
  const primeira = dataLocal(new Date(hojeData.getTime() + ((alvo - hojeData.getDay() + 7) % 7) * UM_DIA));
  return Array.from({ length: quantidade }, (_, i) => somarDias(primeira, i * 7));
}

export function classificacaoPorParto(dataParto: string | null | undefined, dataColeta: string | null | undefined): TipoLeite | null {
  if (!dataParto || !dataColeta) return null;
  const dias = Math.round((new Date(`${dataColeta.slice(0, 10)}T12:00:00`).getTime() - new Date(`${dataParto.slice(0, 10)}T12:00:00`).getTime()) / UM_DIA);
  if (Number.isNaN(dias)) return null;
  if (dias <= 7) return "colostro";
  if (dias <= 14) return "transicao";
  return "maduro";
}

export function preEstocagemPorEquipamento(equipamento: string | null | undefined): "freezer" | "congelador" | null {
  if (equipamento === "freezer") return "freezer";
  if (equipamento === "refrigerador" || equipamento === "duplex") return "congelador";
  return null;
}

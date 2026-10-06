import { api } from "@/services/api";
import type { Doadora, Doadora_Status } from "@/types/doadora";

// Shape returned by the PHP API (snake_case / wrapped).
interface RawDoadora {
  id: number | string;
  nome: string;
  cartao_sus: string;
  telefone: string;
  zona: string;
  data_cadastro: string; // ISO or API-formatted date string
  status: string; // raw status label
  quantidade_coletas: number;
}

// The API may wrap collections and items in a data envelope.
type Envelope<T> = { data: T } | T;

function unwrap<T>(payload: Envelope<T>): T {
  return payload && typeof payload === "object" && "data" in payload
    ? (payload as { data: T }).data
    : (payload as T);
}

function toStatus(raw: string): Doadora_Status {
  switch (raw) {
    case "Ativa":
    case "Em Triagem":
    case "Suspensa":
    case "Inativa":
      return raw;
    default:
      return "Inativa"; // defensive default for unknown labels
  }
}

function mapDoadora(raw: RawDoadora): Doadora {
  return {
    id: String(raw.id),
    nome: raw.nome,
    cartaoSus: raw.cartao_sus,
    telefone: raw.telefone,
    zona: raw.zona,
    dataCadastro: raw.data_cadastro,
    status: toStatus(raw.status),
    quantidadeColetas: raw.quantidade_coletas,
  };
}

// ---------------------------------------------------------------------------
// MOCK TEMPORÁRIO — enquanto a API PHP não está pronta.
// Para voltar a usar a API real, troque USE_MOCK para false (ou remova este
// bloco e o ramo `if (USE_MOCK)` nas funções abaixo).
// ---------------------------------------------------------------------------
const USE_MOCK = true;

const MOCK_DOADORAS: RawDoadora[] = [
  {
    id: 1,
    nome: "Ana Beatriz Souza",
    cartao_sus: "700123456789012",
    telefone: "(14) 99999-0001",
    zona: "Zona Norte",
    data_cadastro: "2025-01-15",
    status: "Ativa",
    quantidade_coletas: 12,
  },
  {
    id: 2,
    nome: "Carla Mendes Lima",
    cartao_sus: "700987654321098",
    telefone: "(14) 99999-0002",
    zona: "Zona Sul",
    data_cadastro: "2025-02-03",
    status: "Em Triagem",
    quantidade_coletas: 0,
  },
  {
    id: 3,
    nome: "Daniela Rocha",
    cartao_sus: "700456789012345",
    telefone: "(14) 99999-0003",
    zona: "Centro",
    data_cadastro: "2024-11-28",
    status: "Suspensa",
    quantidade_coletas: 5,
  },
  {
    id: 4,
    nome: "Eduarda Nunes",
    cartao_sus: "700321654987012",
    telefone: "(14) 99999-0004",
    zona: "Zona Leste",
    data_cadastro: "2024-09-10",
    status: "Inativa",
    quantidade_coletas: 3,
  },
  {
    id: 5,
    nome: "Fernanda Alves Pereira",
    cartao_sus: "700111222333444",
    telefone: "(14) 99999-0005",
    zona: "Zona Oeste",
    data_cadastro: "2025-03-22",
    status: "Ativa",
    quantidade_coletas: 8,
  },
];

// Simula a latência de rede para exercitar o estado de carregamento.
function mockDelay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 500));
}

export async function getDoadoras(): Promise<Doadora[]> {
  if (USE_MOCK) {
    const payload = await mockDelay<Envelope<RawDoadora[]>>(MOCK_DOADORAS);
    return unwrap(payload).map(mapDoadora);
  }
  const payload = await api<Envelope<RawDoadora[]>>("/doadoras");
  return unwrap(payload).map(mapDoadora);
}

export async function getDoadora(id: string): Promise<Doadora> {
  if (USE_MOCK) {
    const found = MOCK_DOADORAS.find((d) => String(d.id) === id);
    if (!found) {
      throw new Error(`Doadora ${id} não encontrada (mock)`);
    }
    const payload = await mockDelay<Envelope<RawDoadora>>(found);
    return mapDoadora(unwrap(payload));
  }
  const payload = await api<Envelope<RawDoadora>>(`/doadoras/${id}`);
  return mapDoadora(unwrap(payload));
}

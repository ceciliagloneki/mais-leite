import {
  LayoutDashboard,
  Users,
  Home,
  ClipboardCheck,
  FlaskConical,
  QrCode,
  Hospital,
  PackageCheck,
  Truck,
  Boxes,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  /** Rótulo exibido no sidebar. */
  label: string;
  /** Rota de destino (Next.js App Router). */
  href: string;
  /** Ícone lucide-react associado ao item. */
  icon: LucideIcon;
  /** Contador opcional exibido como badge (ex.: pendências). */
  badge?: number;
}

// Fonte única de verdade para a navegação lateral. Cada colega responsável por
// uma página adiciona/edita o item correspondente aqui — o Sidebar renderiza a
// partir desta lista e marca o item ativo pela rota atual.
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Doadoras", href: "/doadoras", icon: Users },
  { label: "Coleta Domiciliar", href: "/coleta-domiciliar", icon: Home, badge: 3 },
  { label: "Recepção e Inspeção", href: "/recepcao-inspecao", icon: ClipboardCheck },
  { label: "Processamento", href: "/processamento", icon: FlaskConical, badge: 2 },
  { label: "Rastreabilidade", href: "/rastreabilidade", icon: QrCode },
  { label: "Hospitais e Demandas", href: "/hospitais-demandas", icon: Hospital, badge: 1 },
  { label: "Prep. para Liberação", href: "/preparo-liberacao", icon: PackageCheck },
  { label: "Distribuição", href: "/distribuicao", icon: Truck },
  { label: "Estoque / Frota", href: "/estoque-frota", icon: Boxes },
  { label: "Relatórios", href: "/relatorios", icon: BarChart3 },
];

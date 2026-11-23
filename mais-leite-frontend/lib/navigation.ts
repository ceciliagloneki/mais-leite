import { LayoutDashboard, Users, Home, ClipboardCheck, FlaskConical, Hospital, PackageCheck, Truck, Search, UserCog, type LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  etapa?: number;
}

interface NavGroup {
  titulo?: string;
  itens: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    itens: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    titulo: "Caminho do leite",
    itens: [
      { label: "Doadoras", href: "/doadoras", icon: Users, etapa: 1 },
      { label: "Coleta domiciliar", href: "/coleta-domiciliar", icon: Home, etapa: 2 },
      { label: "Recepção e inspeção", href: "/recepcao", icon: ClipboardCheck, etapa: 3 },
      { label: "Processamento", href: "/processamento", icon: FlaskConical, etapa: 4 },
      { label: "Hospitais e pedidos", href: "/hospitais", icon: Hospital, etapa: 5 },
      { label: "Preparação", href: "/preparacao", icon: PackageCheck, etapa: 6 },
      { label: "Distribuição", href: "/distribuicao", icon: Truck, etapa: 7 },
    ],
  },
  {
    titulo: "Gestão e consultas",
    itens: [
      { label: "Rastreabilidade", href: "/rastreabilidade", icon: Search },
      { label: "Equipe", href: "/funcionarios", icon: UserCog },
    ],
  },
];

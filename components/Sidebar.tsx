"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Droplet, LogOut } from "lucide-react";

import { NAV_ITEMS } from "@/lib/navigation";

// Sidebar fixo da aplicação. Renderiza a navegação a partir de NAV_ITEMS
// (fonte única em lib/navigation.ts) e destaca o item ativo pela rota atual.
// Largura fixa de 16rem (w-64); o layout reserva esse espaço no conteúdo.
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Marca / identificação da unidade */}
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-accent text-sidebar-accent-foreground">
          <Droplet className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-lg font-semibold">+Leite</span>
          <span className="text-xs text-sidebar-muted">
            Banco de Leite Humano de Marília
          </span>
        </div>
      </div>

      {/* Navegação principal */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-sidebar-foreground"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge ? (
                    <span
                      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                        isActive
                          ? "bg-white/20 text-sidebar-accent-foreground"
                          : "bg-sidebar-accent text-sidebar-accent-foreground"
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Rodapé: responsável técnico + sair */}
      <div className="border-t border-sidebar-border px-5 py-4">
        <div className="mb-3 flex flex-col leading-tight">
          <span className="text-sm font-medium">Farm. Carlos Neto</span>
          <span className="text-xs text-sidebar-muted">Responsável Técnico</span>
        </div>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-white/5 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-accent"
        >
          <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
          Sair
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
